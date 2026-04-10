import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isPortalCookieValid } from "@/lib/portal-cookie";

export function middleware(request: NextRequest) {
  const pwd = process.env.PORTAL_PASSWORD;
  if (!pwd) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/portal")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/portal/login")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get("ff_portal_auth")?.value;
  if (isPortalCookieValid(cookie)) {
    return NextResponse.next();
  }

  const login = new URL("/portal/login", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/portal/:path*"],
};
