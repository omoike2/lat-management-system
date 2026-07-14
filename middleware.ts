import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const siteEnabled = process.env.SITE_ENABLED === "true";

  // Allow these routes even when maintenance mode is on
  const allowedPaths = [
    "/maintenance",
    "/favicon.ico",
    "/robots.txt",
  ];

  const pathname = request.nextUrl.pathname;

  const isAllowed =
    allowedPaths.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api");

  if (!siteEnabled && !isAllowed) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
