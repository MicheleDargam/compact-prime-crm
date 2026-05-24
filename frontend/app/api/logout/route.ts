import { NextResponse } from "next/server";

export async function POST() {
  const isProduction = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ ok: true });
  response.cookies.set("crm_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 0,
    path: "/",
  });
  return response;
}
