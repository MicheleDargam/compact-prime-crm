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

    // First day of 6 months ago
    const sixMonthsAgo = new Date(year, month - 5, 1);

    const [
      receitaResult,
      leadsNoMes,
      eventosFechados,
      eventosTotais,
      eventosPorTipoRaw,
      receitaAnteriorResult,
      leadsMesAnterior,
      historicoRaw,
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
      prisma.$queryRaw<Array<{ yr: number; mo: number; revenue: number }>>`
        SELECT
          EXTRACT(YEAR  FROM data_pagamento)::int AS yr,
          EXTRACT(MONTH FROM data_pagamento)::int AS mo,
          COALESCE(SUM(valor_recebido), 0)::float  AS revenue
        FROM pagamentos
        WHERE data_pagamento >= ${sixMonthsAgo}
          AND data_pagamento <= ${lastDay}
        GROUP BY yr, mo
        ORDER BY yr, mo
      `,
    ]);

    // Build full 6-month array (fill gaps with 0)
    const historicoReceita = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(year, month - 5 + i, 1);
      const yr = d.getFullYear();
      const mo = d.getMonth() + 1;
      const found = historicoRaw.find((r) => r.yr === yr && r.mo === mo);
      const label = d.toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", "")
        .replace(/^\w/, (c) => c.toUpperCase());
      return { yr, mo, revenue: found ? found.revenue : 0, label };
    });

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
        historicoReceita,
      },
    });
  } catch (error) {
    console.error("[GET /api/dashboard]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
