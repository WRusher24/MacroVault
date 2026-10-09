import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "mv_session"; // Use your project's cookie name
const PROTECTED_PREFIXES = ["/dashboard", "/plans", "/foods", "/settings", "/history"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // Only redirect if trying to enter a protected route without a session
  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Allow /login and /register freely so users can overwrite dead cookies
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/plans/:path*",
    "/foods/:path*",
    "/settings/:path*",
    "/history/:path*",
    "/login",
    "/register",
  ],
};