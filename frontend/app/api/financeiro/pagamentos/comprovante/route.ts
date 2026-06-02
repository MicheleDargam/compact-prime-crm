import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  (process.env.URL_SUPABASE ?? process.env.SUPABASE_URL)!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("comprovante") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ ok: false, error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const allowed = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ ok: false, error: "Formato inválido. Use PDF, PNG ou JPG." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: "Arquivo muito grande. Máximo 5 MB." }, { status: 400 });
    }

    const ext = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1];
    const storagePath = `comprovantes/comprovante_${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("uploads")
      .upload(storagePath, buffer, { contentType: file.type });

    if (uploadError) {
      console.error("[comprovante upload]", uploadError);
      return NextResponse.json({ ok: false, error: "Erro ao enviar arquivo." }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("uploads").getPublicUrl(storagePath);

    return NextResponse.json({ ok: true, url: urlData.publicUrl });
  } catch (error) {
    console.error("[POST /api/financeiro/pagamentos/comprovante]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
