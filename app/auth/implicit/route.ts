import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/shared/config";

const allowedRedirects = new Set([
  "/patient/dashboard",
  "/provider/dashboard",
  "/admin/dashboard",
]);

function resolveRedirect(nextParam: string | null) {
  if (!nextParam) return "/patient/dashboard";
  if (allowedRedirects.has(nextParam)) return nextParam;
  return "/patient/dashboard";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const accessToken = requestUrl.searchParams.get("access_token");
  const refreshToken = requestUrl.searchParams.get("refresh_token");
  const nextParam = requestUrl.searchParams.get("next");
  const redirectTarget = resolveRedirect(nextParam);

  console.log("[auth] implicit callback", {
    hasAccessToken: Boolean(accessToken),
    hasRefreshToken: Boolean(refreshToken),
    redirectTarget,
  });

  if (!accessToken || !refreshToken) {
    const fallbackUrl = new URL("/sign-in", request.url);
    fallbackUrl.searchParams.set("error", "missing_tokens");
    return NextResponse.redirect(fallbackUrl);
  }

  const { url, anonKey } = getSupabaseConfig();
  const response = NextResponse.redirect(new URL(redirectTarget, request.url));
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    const fallbackUrl = new URL("/sign-in", request.url);
    fallbackUrl.searchParams.set("error", "session_failed");
    return NextResponse.redirect(fallbackUrl);
  }

  return response;
}
