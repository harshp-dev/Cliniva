import type { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/domain";

export interface RequestContext {
  userId: string;
  organizationId: string;
  role: AppRole;
  supabase: ReturnType<typeof createServerSupabaseClient>;
}

export async function getRequestContext(request: NextRequest): Promise<RequestContext | null> {
  const supabase = createServerSupabaseClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (error || !profile?.organization_id) {
    return null;
  }

  const headerOrg = request.headers.get("x-organization-id");
  if (headerOrg && headerOrg !== profile.organization_id) {
    return null;
  }

  return {
    userId: user.id,
    organizationId: profile.organization_id,
    role: profile.role as AppRole,
    supabase
  };
}
