import 'dotenv/config';
import { prisma } from './lib/prisma';

async function main() {
  console.log("Iniciando query...");
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59);
    const prevFirstDay = new Date(year, month - 1, 1);
    const prevLastDay = new Date(year, month, 0, 23, 59, 59);
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
      prisma.$queryRaw`
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

    console.log("Sucesso!", { leadsNoMes, eventosFechados });
  } catch (error) {
    console.error("ERRO COMPLETO:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
