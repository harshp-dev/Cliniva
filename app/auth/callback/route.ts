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
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next");
  const redirectTarget = resolveRedirect(nextParam);

  const redirectUrl = new URL(redirectTarget, request.url);
  const response = NextResponse.redirect(redirectUrl);

  if (!code) {
    const fallbackUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(fallbackUrl);
  }

  const { url, anonKey } = getSupabaseConfig();
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

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const fallbackUrl = new URL("/sign-in", request.url);
    fallbackUrl.searchParams.set("error", "auth_failed");
    return NextResponse.redirect(fallbackUrl);
  }

  return response;
}
