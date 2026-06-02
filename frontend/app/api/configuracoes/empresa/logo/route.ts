import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

const supabaseAdmin = createClient(
  (process.env.URL_SUPABASE ?? process.env.SUPABASE_URL)!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("logo") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ ok: false, error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ ok: false, error: "Formato inválido. Use PNG, JPG, WebP ou SVG." }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: "Arquivo muito grande. Máximo 2 MB." }, { status: 400 });
    }

    const ext = file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1];
    const storagePath = `logos/logo.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("uploads")
      .upload(storagePath, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("[logo upload]", uploadError);
      return NextResponse.json({ ok: false, error: "Erro ao enviar arquivo." }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("uploads").getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    await prisma.$executeRaw`
      INSERT INTO configuracoes_empresa (id, logo_url, updated_at)
      VALUES ('singleton', ${publicUrl}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        logo_url   = EXCLUDED.logo_url,
        updated_at = NOW()
    `;

    return NextResponse.json({ ok: true, url: `${publicUrl}?t=${Date.now()}` });
  } catch (error) {
    console.error("[POST /api/configuracoes/empresa/logo]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
