import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("crm_session")?.value;

  if (!sessionToken) {
    return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ ok: false, error: "Preencha todos os campos." }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ ok: false, error: "A nova senha deve ter pelo menos 6 caracteres." }, { status: 400 });
  }

  // Create a user-scoped client using the session token from the cookie
  const supabaseUser = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: { Authorization: `Bearer ${sessionToken}` },
      },
    }
  );

  // Get the current user's email to re-verify the current password
  const { data: userData, error: userError } = await supabaseUser.auth.getUser();

  if (userError || !userData.user?.email) {
    return NextResponse.json({ ok: false, error: "Sessão inválida. Faça login novamente." }, { status: 401 });
  }

  // Re-authenticate to verify the current password
  const { error: signInError } = await supabaseUser.auth.signInWithPassword({
    email: userData.user.email,
    password: currentPassword,
  });

  if (signInError) {
    return NextResponse.json({ ok: false, error: "Senha atual incorreta." }, { status: 401 });
  }

  // Update to the new password
  const { error: updateError } = await supabaseUser.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return NextResponse.json({ ok: false, error: "Erro ao atualizar senha." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
