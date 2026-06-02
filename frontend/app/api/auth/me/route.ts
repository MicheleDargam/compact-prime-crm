import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("crm_session")?.value;

  if (!sessionToken) {
    return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data, error } = await supabase.auth.getUser(sessionToken);

  if (error || !data.user) {
    return NextResponse.json({ ok: false, error: "Sessão inválida." }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    email: data.user.email ?? "",
    id: data.user.id,
  });
}
