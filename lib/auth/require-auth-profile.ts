import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server/client";
import type { UserRole } from "@/types/domain/auth";
import type { DashboardUser } from "@/types/domain/dashboard";

export async function requireAuthProfile(expectedRole?: UserRole) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    redirect("/sign-in");
  }

  if (expectedRole && profile.role !== expectedRole) {
    redirect(`/${profile.role}/dashboard`);
  }

  const authProfile: DashboardUser = {
    id: profile.id,
    fullName: profile.full_name ?? user.email?.split("@")[0] ?? "Cliniva user",
    email: profile.email ?? user.email ?? "",
    phone: profile.phone,
    role: profile.role,
  };

  return {
    supabase,
    profile: authProfile,
  };
}
