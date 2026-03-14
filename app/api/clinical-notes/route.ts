import type { NextRequest } from "next/server";
import { error, ok, created } from "@/lib/api/response";
import { hasRequiredRole } from "@/lib/auth/guards";
import { getRequestContext } from "@/lib/auth/request-context";
import { clinicalNoteCreateSchema } from "@/lib/validators/clinical-note";

const ALLOWED_ROLES = ["admin", "provider", "staff"] as const;

export async function GET(request: NextRequest) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }
  if (!hasRequiredRole(context.role, [...ALLOWED_ROLES])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 50), 100);
  const offset = Math.max(Number(request.nextUrl.searchParams.get("offset") ?? 0), 0);
  const patientId = request.nextUrl.searchParams.get("patient_id");

  let query = context.supabase
    .from("clinical_notes")
    .select("*", { count: "exact" })
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (patientId) {
    query = query.eq("patient_id", patientId);
  }

  const { data, count, error: queryError } = await query;
  if (queryError) {
    return error(500, "query_failed", queryError.message);
  }

  return ok(data ?? [], { count: count ?? 0, limit, offset });
}

export async function POST(request: NextRequest) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }
  if (!hasRequiredRole(context.role, [...ALLOWED_ROLES])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return error(400, "invalid_json", "Request body must be valid JSON");
  }

  const parsed = clinicalNoteCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return error(400, "validation_error", "Invalid request body", parsed.error.flatten());
  }

  const noteRecord = {
    ...parsed.data,
    organization_id: context.organizationId
  };

  const { data: note, error: noteError } = await context.supabase
    .from("clinical_notes")
    .insert(noteRecord)
    .select("*")
    .single();

  if (noteError || !note) {
    return error(500, "insert_failed", noteError?.message ?? "Unable to create clinical note");
  }

  const summary = [parsed.data.subjective, parsed.data.objective, parsed.data.assessment]
    .filter((entry): entry is string => Boolean(entry?.trim()))
    .join("\n")
    .slice(0, 4000);

  await context.supabase.from("medical_records").insert({
    organization_id: context.organizationId,
    patient_id: parsed.data.patient_id,
    provider_id: parsed.data.provider_id,
    record_type: parsed.data.note_type,
    summary: summary || "Clinical note recorded",
    payload: {
      clinical_note_id: note.id,
      subjective: parsed.data.subjective ?? null,
      objective: parsed.data.objective ?? null,
      assessment: parsed.data.assessment ?? null,
      plan: parsed.data.plan ?? null
    }
  });

  return created(note);
}
