import type { SupabaseClient } from "@supabase/supabase-js";

type AuditMetadata = Record<string, unknown>;

export type CreateAuditLogInput = {
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: AuditMetadata | null;
};

export async function createAuditLog(
  supabase: SupabaseClient,
  input: CreateAuditLogInput
) {
  const { error } = await supabase.rpc("create_audit_log", {
    p_action: input.action,
    p_entity_type: input.entityType,
    p_entity_id: input.entityId ?? null,
    p_metadata: input.metadata ?? null,
  });

  if (error) {
    throw error;
  }
}

export async function createAuditLogSafely(
  supabase: SupabaseClient,
  input: CreateAuditLogInput
) {
  try {
    await createAuditLog(supabase, input);
  } catch (error) {
    console.error("[audit] unable to create audit log", {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      error,
    });
  }
}
