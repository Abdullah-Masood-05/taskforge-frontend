import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Edge Middleware — route protection.
 *
 * Auth check strategy: We read from localStorage-persisted Zustand state.
 * Since Edge middleware can't access localStorage (it runs on the server/edge),
 * we check for the presence of a custom `taskforge_auth_flag` cookie that the
 * client sets when auth is established (set in authStore hydration).
 *
 * This is the standard pattern for localStorage-based auth with Next.js middleware.
 * The flag cookie holds no sensitive data — only a boolean presence indicator.
 * The actual JWT is in localStorage and is attached by the API client.
 */

const PUBLIC_PATHS = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through: API routes, static assets, Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Check auth flag cookie (set by the client-side auth store on login)
  const isAuthenticated = request.cookies.has("taskforge_authenticated");

  // Unauthenticated → redirect to login (except public paths)
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    // Preserve intended destination for post-login redirect
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated → redirect away from auth pages to dashboard
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
