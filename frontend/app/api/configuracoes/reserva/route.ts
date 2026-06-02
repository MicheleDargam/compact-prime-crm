import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<
      Array<{ id: string; objetivo: string | null; meta: number; acumulado: number; percentual_reserva: number }>
    >`SELECT id, objetivo, meta::float AS meta, acumulado::float AS acumulado, percentual_reserva FROM reserva_buffet WHERE id = 'singleton' LIMIT 1`;

    const defaults = { objetivo: "Fundo de Expansão e Capital de Giro", meta: 50000, acumulado: 0, percentual_reserva: 20 };
    return NextResponse.json({ ok: true, data: rows[0] ?? defaults });
  } catch (error) {
    console.error("[GET /api/configuracoes/reserva]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { objetivo = null, meta = 50000, acumulado = 0, percentual_reserva = 20 } = await request.json();

    await prisma.$executeRaw`
      INSERT INTO reserva_buffet (id, objetivo, meta, acumulado, percentual_reserva, updated_at)
      VALUES ('singleton', ${objetivo}, ${Number(meta)}, ${Number(acumulado)}, ${Number(percentual_reserva)}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        objetivo           = EXCLUDED.objetivo,
        meta               = EXCLUDED.meta,
        acumulado          = EXCLUDED.acumulado,
        percentual_reserva = EXCLUDED.percentual_reserva,
        updated_at         = NOW()
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PUT /api/configuracoes/reserva]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
