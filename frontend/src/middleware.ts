import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Skip middleware for API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Redirect /auth to profile or login
  if (pathname === "/auth") {
    if (token) {
      return NextResponse.redirect(new URL("/auth/profile", req.url));
    } else {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // Redirect authenticated users away from login/register
  if (token && ["/auth/login", "/auth/register"].includes(pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect profile routes - require authentication
  if (!token && pathname.startsWith("/auth/profile")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth", "/auth/login", "/auth/register", "/auth/profile/:path*"],
};