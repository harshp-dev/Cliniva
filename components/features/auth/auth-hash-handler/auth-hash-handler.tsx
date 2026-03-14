"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser/client";
import { getProfileRole } from "@/lib/services/profiles/get-profile-role";

const allowedRedirects = new Set([
  "/patient/dashboard",
  "/provider/dashboard",
  "/admin/dashboard",
]);

function resolveRedirect(nextParam: string | null) {
  if (nextParam && allowedRedirects.has(nextParam)) return nextParam;
  return null;
}

export function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) return;

    const supabase = getBrowserSupabaseClient();

    const finishAuth = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      let fallbackPath = "/patient/dashboard";
      if (user) {
        const role = await getProfileRole(supabase, user.id);
        if (role === "provider") fallbackPath = "/provider/dashboard";
        if (role === "admin") fallbackPath = "/admin/dashboard";
      }

      const nextParam = new URLSearchParams(window.location.search).get("next");
      const redirectPath = resolveRedirect(nextParam) ?? fallbackPath;

      console.log("[auth] hash flow detected", {
        hasAccessToken: Boolean(accessToken),
        hasRefreshToken: Boolean(refreshToken),
        redirectPath,
      });

      const implicitUrl = new URL("/auth/implicit", window.location.origin);
      implicitUrl.searchParams.set("access_token", accessToken);
      implicitUrl.searchParams.set("refresh_token", refreshToken);
      implicitUrl.searchParams.set("next", redirectPath);

      window.location.replace(implicitUrl.toString());
    };

    finishAuth();
  }, [router]);

  return null;
}
