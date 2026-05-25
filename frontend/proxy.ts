import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PUBLIC_PATHS = ["/login", "/api/login", "/api/logout"];

function getExpectedToken(): string {
  const password = (process.env.CRM_ACCESS_PASSWORD ?? "").trim();
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("crm_session");

  if (sessionCookie?.value === getExpectedToken()) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
  ],
};
