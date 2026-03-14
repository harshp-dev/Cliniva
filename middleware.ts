import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware";

const AUTH_ROUTES = ["/dashboard", "/patients", "/appointments", "/consultation", "/billing", "/provider", "/patient", "/api"];
const PROVIDER_ROUTES = ["/provider", "/patients"];
const ADMIN_ROUTES = ["/billing", "/api/claims", "/api/payments"];

function startsWith(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

function withSupabaseCookies(target: NextResponse, source: NextResponse) {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
  return target;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!startsWith(pathname, AUTH_ROUTES)) {
    return NextResponse.next();
  }

  // This response instance is passed to Supabase so any auth cookie mutations are captured.
  const supabaseResponse = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient(request, supabaseResponse);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return withSupabaseCookies(NextResponse.redirect(loginUrl), supabaseResponse);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return withSupabaseCookies(NextResponse.redirect(new URL("/login", request.url)), supabaseResponse);
  }

  if (startsWith(pathname, PROVIDER_ROUTES) && !["admin", "provider", "staff"].includes(profile.role)) {
    return withSupabaseCookies(NextResponse.redirect(new URL("/dashboard", request.url)), supabaseResponse);
  }

  if (startsWith(pathname, ADMIN_ROUTES) && profile.role !== "admin") {
    return withSupabaseCookies(NextResponse.redirect(new URL("/dashboard", request.url)), supabaseResponse);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-organization-id", profile.organization_id);
  requestHeaders.set("x-user-role", profile.role);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
  return withSupabaseCookies(response, supabaseResponse);
}

export const config = {
  matcher: ["/dashboard/:path*", "/patients/:path*", "/appointments/:path*", "/consultation/:path*", "/billing/:path*", "/provider/:path*", "/patient/:path*", "/api/:path*"]
};
