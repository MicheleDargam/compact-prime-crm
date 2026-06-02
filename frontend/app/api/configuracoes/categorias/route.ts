import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PRIORIDADE_MAP: Record<string, number> = { "Normal": 0, "Alta": 1, "Máxima": 2 };
const PRIORIDADE_REVERSE: Record<number, string> = { 0: "Normal", 1: "Alta", 2: "Máxima" };

export async function GET() {
  try {
    const cats = await prisma.categorias_cliente.findMany({
      where: { deleted_at: null },
      select: { id: true, nome: true, criterio: true, prioridade: true },
      orderBy: { prioridade: "asc" },
    });

    const data = cats.map((c) => ({
      id: c.id,
      nome: c.nome,
      criterio: c.criterio ?? "",
      prioridade: PRIORIDADE_REVERSE[c.prioridade] ?? "Normal",
    }));

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("[GET /api/configuracoes/categorias]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as Array<{ id: string; criterio: string; prioridade: string }>;

    if (!Array.isArray(body)) {
      return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
    }

    for (const cat of body) {
      const prioridadeNum = PRIORIDADE_MAP[cat.prioridade] ?? 0;
      await prisma.categorias_cliente.update({
        where: { id: cat.id },
        data: {
          criterio: cat.criterio?.trim() || null,
          prioridade: prioridadeNum,
          updated_at: new Date(),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PUT /api/configuracoes/categorias]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
