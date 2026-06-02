import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const servicos = await prisma.servicos.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, tipo: true, ativo: true },
    });
    return NextResponse.json({ ok: true, data: servicos });
  } catch (error) {
    console.error("[GET /api/configuracoes/servicos]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ativo } = await request.json() as { id: string; ativo: boolean };

    if (!id || typeof ativo !== "boolean") {
      return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
    }

    await prisma.servicos.update({
      where: { id },
      data: { ativo, updated_at: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PATCH /api/configuracoes/servicos]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
