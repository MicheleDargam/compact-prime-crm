import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

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
    const filename = `logo.${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);

    const logoUrl = `/uploads/${filename}`;

    await prisma.$executeRaw`
      INSERT INTO configuracoes_empresa (id, logo_url, updated_at)
      VALUES ('singleton', ${logoUrl}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        logo_url   = EXCLUDED.logo_url,
        updated_at = NOW()
    `;

    return NextResponse.json({ ok: true, url: logoUrl });
  } catch (error) {
    console.error("[POST /api/configuracoes/empresa/logo]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
