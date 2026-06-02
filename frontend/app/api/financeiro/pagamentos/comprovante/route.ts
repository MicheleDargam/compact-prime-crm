import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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
    const filename = `comprovante_${Date.now()}.${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "comprovantes");

    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({ ok: true, url: `/uploads/comprovantes/${filename}` });
  } catch (error) {
    console.error("[POST /api/financeiro/pagamentos/comprovante]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
