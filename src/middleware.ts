import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicPath =
    pathname === "/signin" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/logo");

  if (isPublicPath) {
    return NextResponse.next();
  }

  const isSignedIn = req.cookies.get("mock_supervisor_auth")?.value === "1";
  if (!isSignedIn) {
    const signInUrl = new URL("/signin", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
