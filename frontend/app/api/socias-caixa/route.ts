import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month"); // e.g. "2026-05"

    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;

    if (monthParam) {
      const [y, m] = monthParam.split("-").map(Number);
      if (y && m) { year = y; month = m; }
    }

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0, 23, 59, 59);

    const [receitaResult, despesas] = await Promise.all([
      prisma.pagamentos.aggregate({
        _sum: { valor_recebido: true },
        where: { data_pagamento: { gte: firstDay, lte: lastDay } },
      }),
      prisma.despesas_buffet.findMany({
        where: { data_despesa: { gte: firstDay, lte: lastDay } },
        orderBy: { data_despesa: "desc" },
      }),
    ]);

    const receita = Number(receitaResult._sum.valor_recebido ?? 0);
    const totalDespesas = despesas.reduce((s, d) => s + Number(d.valor), 0);

    const categorias: Record<string, number> = {};
    for (const d of despesas) {
      categorias[d.categoria] = (categorias[d.categoria] ?? 0) + Number(d.valor);
    }

    return NextResponse.json({
      ok: true,
      data: {
        year,
        month,
        receita,
        totalDespesas,
        lucroDisponivel: receita - totalDespesas,
        categorias,
        despesas: despesas.map((d) => ({
          id: d.id,
          descricao: d.descricao,
          categoria: d.categoria,
          fornecedor: d.fornecedor,
          valor: Number(d.valor),
          formaPagamento: d.forma_pagamento,
          data: new Date(d.data_despesa).toLocaleDateString("pt-BR"),
          observacoes: d.observacoes,
        })),
      },
    });
  } catch (error) {
    console.error("[GET /api/socias-caixa]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
