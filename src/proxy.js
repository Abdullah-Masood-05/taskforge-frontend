import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Pass through: API routes, static assets, Next.js internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Check the lightweight authentication cookie set by the Zustand store
  const isAuthenticated = request.cookies.has("taskforge_authenticated");
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // If not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access login/register
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
