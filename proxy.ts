import { NextResponse, type NextRequest } from "next/server";
import {
  PENDING_COOKIE,
  SESSION_COOKIE,
  verifyPendingToken,
  verifySessionToken,
} from "@/lib/tokens";

/**
 * PROXY (called "middleware" before Next.js 16)
 *
 * Runs before a matching route renders, so it is a cheap place to send people
 * to the right page:
 *
 *   /dashboard  needs a valid SESSION token          -> otherwise /login
 *   /verify     needs a valid PENDING token          -> otherwise /login
 *   /login      if already fully logged in           -> /dashboard
 *
 * This is an optimistic check: it only reads cookies. The pages and actions
 * check again themselves (see verifySession in lib/session.ts), so a bug here
 * cannot expose protected data on its own.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/verify")) {
    if (session) return NextResponse.redirect(new URL("/dashboard", request.url));
    const pending = await verifyPendingToken(request.cookies.get(PENDING_COOKIE)?.value);
    if (!pending) return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/login") && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Only run on these routes, not on images, CSS or JS files.
export const config = {
  matcher: ["/dashboard/:path*", "/verify", "/login"],
};
