import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mes = searchParams.get("mes");

  if (!mes) {
    return NextResponse.json({ ok: false, error: "Parâmetro 'mes' obrigatório." }, { status: 400 });
  }

  try {
    const retiradas = await prisma.$queryRaw<
      Array<{ socia_id: string; valor_retirado: number; status: string }>
    >`
      SELECT socia_id, valor_retirado::float AS valor_retirado, status
      FROM retiradas_socias
      WHERE mes_ano = ${mes}
    `;

    return NextResponse.json({ ok: true, data: retiradas });
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

    await prisma.$executeRaw`
      INSERT INTO retiradas_socias (socia_id, mes_ano, valor_retirado, status)
      VALUES (${socia_id}::uuid, ${mes_ano}, ${valor_retirado}, ${status})
      ON CONFLICT (socia_id, mes_ano) DO UPDATE SET
        valor_retirado = EXCLUDED.valor_retirado,
        status         = EXCLUDED.status,
        updated_at     = NOW()
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PUT /api/socias-caixa/retiradas]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
