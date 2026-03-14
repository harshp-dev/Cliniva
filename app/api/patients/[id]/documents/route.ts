import type { NextRequest } from "next/server";
import { z } from "zod";
import { error, ok } from "@/lib/api/response";
import { hasRequiredRole } from "@/lib/auth/guards";
import { getRequestContext } from "@/lib/auth/request-context";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const ALLOWED_ROLES = ["admin", "provider", "staff"] as const;
const uuidSchema = z.string().uuid();
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

function sanitizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  if (!hasRequiredRole(context.role, [...ALLOWED_ROLES])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const idParsed = uuidSchema.safeParse(params.id);
  if (!idParsed.success) {
    return error(400, "validation_error", "Invalid patient id");
  }

  const { data: patient } = await context.supabase
    .from("patients")
    .select("id")
    .eq("organization_id", context.organizationId)
    .eq("id", idParsed.data)
    .single();

  if (!patient) {
    return error(404, "not_found", "Patient not found");
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return error(400, "invalid_form_data", "Multipart form data is required");
  }

  const fileValue = formData.get("file");
  const documentType = String(formData.get("document_type") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!(fileValue instanceof File)) {
    return error(400, "validation_error", "Missing upload file");
  }

  if (!documentType) {
    return error(400, "validation_error", "document_type is required");
  }

  if (fileValue.size === 0 || fileValue.size > MAX_FILE_SIZE) {
    return error(400, "validation_error", "File size must be between 1 byte and 10 MB");
  }

  if (!ALLOWED_MIME_TYPES.has(fileValue.type)) {
    return error(400, "validation_error", "Unsupported file type");
  }

  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch {
    return error(500, "configuration_error", "SUPABASE_SERVICE_ROLE_KEY is required for file uploads");
  }

  const safeName = sanitizeFileName(fileValue.name);
  const filePath = `${context.organizationId}/${idParsed.data}/${Date.now()}-${safeName}`;
  const fileBuffer = Buffer.from(await fileValue.arrayBuffer());

  const { error: uploadError } = await admin.storage.from("patient-documents").upload(filePath, fileBuffer, {
    contentType: fileValue.type,
    upsert: false
  });

  if (uploadError) {
    return error(500, "upload_failed", uploadError.message);
  }

  const { data: document, error: insertError } = await context.supabase
    .from("documents")
    .insert({
      organization_id: context.organizationId,
      patient_id: idParsed.data,
      uploaded_by: context.userId,
      file_path: filePath,
      file_type: fileValue.type,
      metadata: {
        original_name: fileValue.name,
        document_type: documentType,
        description: description || null,
        size: fileValue.size
      }
    })
    .select("*")
    .single();

  if (insertError || !document) {
    return error(500, "insert_failed", insertError?.message ?? "Document upload metadata insert failed");
  }

  const { data: signedUrlData } = await admin.storage.from("patient-documents").createSignedUrl(filePath, 60 * 10);

  return ok({
    ...document,
    signed_url: signedUrlData?.signedUrl ?? null
  });
}
