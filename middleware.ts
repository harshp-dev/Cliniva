import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/shared/config";

const protectedPrefixes = ["/patient", "/provider", "/admin"];
const roleRouteMap: Record<string, "/patient" | "/provider" | "/admin"> = {
  patient: "/patient",
  provider: "/provider",
  admin: "/admin",
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
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

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtectedRoute && !session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isProtectedRoute && session?.user) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();

    if (error || !profile?.role) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/sign-in";
      return NextResponse.redirect(redirectUrl);
    }

    const expectedPrefix = roleRouteMap[profile.role];
    if (expectedPrefix && !pathname.startsWith(expectedPrefix)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `${expectedPrefix}/dashboard`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/patient/:path*", "/provider/:path*", "/admin/:path*"],
};
