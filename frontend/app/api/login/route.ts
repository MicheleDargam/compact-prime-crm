import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function getToken(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: NextRequest) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  const { password } = body;
  const expected = process.env.CRM_ACCESS_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "Senha de acesso não configurada no servidor." },
      { status: 500 }
    );
  }

  if (!password || password !== expected) {
    return NextResponse.json({ ok: false, error: "Senha incorreta." }, { status: 401 });
  }

  const token = getToken(expected);
  const isProduction = process.env.NODE_ENV === "production";

  const response = NextResponse.json({ ok: true });
  response.cookies.set("crm_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
