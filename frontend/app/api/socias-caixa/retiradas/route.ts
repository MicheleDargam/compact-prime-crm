import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mes = searchParams.get("mes"); // e.g. "2026-05"

  if (!mes) {
    return NextResponse.json({ ok: false, error: "Parâmetro 'mes' obrigatório." }, { status: 400 });
  }

  try {
    const retiradas = await prisma.retiradas_socias.findMany({
      where: { mes_ano: mes },
    });

    return NextResponse.json({
      ok: true,
      data: retiradas.map((r) => ({
        socia_id: r.socia_id,
        valor_retirado: Number(r.valor_retirado),
        status: r.status,
      })),
    });
  } catch (error) {
    console.error("[GET /api/socias-caixa/retiradas]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { socia_id, mes_ano, valor_retirado, status } = await request.json() as {
      socia_id: string;
      mes_ano: string;
      valor_retirado: number;
      status: string;
    };

    if (!socia_id || !mes_ano) {
      return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
    }

    await prisma.retiradas_socias.upsert({
      where: { socia_id_mes_ano: { socia_id, mes_ano } },
      update: { valor_retirado, status, updated_at: new Date() },
      create: { socia_id, mes_ano, valor_retirado, status },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PUT /api/socias-caixa/retiradas]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
