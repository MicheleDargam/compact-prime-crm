import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59);
    const prevFirstDay = new Date(year, month - 1, 1);
    const prevLastDay = new Date(year, month, 0, 23, 59, 59);

    const [
      receitaResult,
      leadsNoMes,
      eventosFechados,
      eventosTotais,
      eventosPorTipoRaw,
      receitaAnteriorResult,
      leadsMesAnterior,
    ] = await Promise.all([
      prisma.pagamentos.aggregate({
        _sum: { valor_recebido: true },
        where: { data_pagamento: { gte: firstDay, lte: lastDay } },
      }),
      prisma.clientes.count({
        where: { created_at: { gte: firstDay, lte: lastDay }, deleted_at: null },
      }),
      prisma.eventos.count({ where: { status: "fechado", deleted_at: null } }),
      prisma.eventos.count({ where: { deleted_at: null } }),
      prisma.eventos.groupBy({
        by: ["tipo_evento"],
        where: { deleted_at: null },
        _count: { id: true },
      }),
      prisma.pagamentos.aggregate({
        _sum: { valor_recebido: true },
        where: { data_pagamento: { gte: prevFirstDay, lte: prevLastDay } },
      }),
      prisma.clientes.count({
        where: { created_at: { gte: prevFirstDay, lte: prevLastDay }, deleted_at: null },
      }),
    ]);

    const eventosPorTipo: Record<string, number> = {};
    for (const row of eventosPorTipoRaw) {
      if (row.tipo_evento) eventosPorTipo[row.tipo_evento] = row._count.id;
    }

    return NextResponse.json({
      ok: true,
      data: {
        receitaMes: Number(receitaResult._sum.valor_recebido ?? 0),
        leadsNoMes,
        eventosFechados,
        eventosTotais,
        eventosPorTipo,
        receitaMesAnterior: Number(receitaAnteriorResult._sum.valor_recebido ?? 0),
        leadsMesAnterior,
      },
    });
  } catch (error) {
    console.error("[GET /api/dashboard]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
