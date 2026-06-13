import { NextRequest, NextResponse } from "next/server";

function decodeJwt(token: string): { email?: string; sub?: string } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = Buffer.from(payload, "base64url").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("crm_session")?.value;

  if (!sessionToken) {
    return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  }

  const payload = decodeJwt(sessionToken);

  if (!payload?.email) {
    return NextResponse.json({ ok: false, error: "Sessão inválida." }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    email: payload.email,
    id: payload.sub ?? "",
  });
}
