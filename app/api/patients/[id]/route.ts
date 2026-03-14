import type { NextRequest } from "next/server";
import { z } from "zod";
import { error, ok } from "@/lib/api/response";
import { hasRequiredRole } from "@/lib/auth/guards";
import { getRequestContext } from "@/lib/auth/request-context";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { patientUpdateSchema } from "@/lib/validators/patient";

const uuidSchema = z.string().uuid();
const ALLOWED_ROLES = ["admin", "provider", "staff"] as const;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  if (!hasRequiredRole(context.role, [...ALLOWED_ROLES])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const { id } = await params;
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    return error(400, "validation_error", "Invalid patient id");
  }

  const { data: patient, error: patientError } = await context.supabase
    .from("patients")
    .select("*")
    .eq("organization_id", context.organizationId)
    .eq("id", idParsed.data)
    .single();

  if (patientError || !patient) {
    return error(404, "not_found", "Patient not found");
  }

  const { data: documents, error: docError } = await context.supabase
    .from("documents")
    .select("id, file_path, file_type, metadata, created_at")
    .eq("organization_id", context.organizationId)
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false });

  if (docError) {
    return error(500, "query_failed", docError.message);
  }

  let files = documents ?? [];
  try {
    const admin = createAdminSupabaseClient();
    files = await Promise.all(
      (documents ?? []).map(async (entry) => {
        const { data } = await admin.storage.from("patient-documents").createSignedUrl(entry.file_path, 60 * 10);
        return {
          ...entry,
          signed_url: data?.signedUrl ?? null
        };
      })
    );
  } catch {
    // Service role can be absent in non-production local scenarios.
  }

  return ok({
    ...patient,
    documents: files
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  if (!hasRequiredRole(context.role, [...ALLOWED_ROLES])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const { id } = await params;
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    return error(400, "validation_error", "Invalid patient id");
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return error(400, "invalid_json", "Request body must be valid JSON");
  }

  const parsed = patientUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return error(400, "validation_error", "Invalid request body", parsed.error.flatten());
  }

  const { data, error: updateError } = await context.supabase
    .from("patients")
    .update(parsed.data)
    .eq("organization_id", context.organizationId)
    .eq("id", idParsed.data)
    .select("*")
    .single();

  if (updateError || !data) {
    return error(500, "update_failed", updateError?.message ?? "Unable to update patient profile");
  }

  return ok(data);
}

