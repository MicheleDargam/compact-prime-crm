import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeServiceType(tipo: string): string | null {
  const t = tipo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (t.includes("buffet")) return "buffet";
  if (t.includes("decora")) return "decoracao";
  if (t.includes("fotograf")) return "fotografia";
  return null;
}

function fmt(val: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

export async function GET() {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [receitaMesResult, aReceberResult, parcelasPendentes, contratos, pagamentosRecentes] =
      await Promise.all([
        prisma.pagamentos.aggregate({
          _sum: { valor_recebido: true },
          where: { data_pagamento: { gte: firstDay, lte: lastDay } },
        }),
        prisma.pagamentos.aggregate({
          _sum: { valor_total: true },
          where: { status: { in: ["pendente", "parcial"] } },
        }),
        prisma.parcelas.count({ where: { status: { in: ["pendente", "atrasado"] } } }),
        prisma.contratos.findMany({
          where: { status: { not: "cancelado" } },
          orderBy: { created_at: "desc" },
          take: 20,
          include: {
            clientes: true,
            eventos: {
              include: {
                evento_servicos: { include: { servicos: true } },
              },
            },
            pagamentos: { include: { parcelas: true } },
          },
        }),
        prisma.pagamentos.findMany({
          orderBy: { data_pagamento: "desc" },
          take: 10,
          include: {
            clientes: true,
            eventos: true,
          },
        }),
      ]);

    const contratosData = contratos.map((c) => {
      const servicos: string[] = [];
      for (const es of c.eventos.evento_servicos) {
        const tipo = normalizeServiceType(es.servicos.tipo);
        if (tipo && !servicos.includes(tipo)) servicos.push(tipo);
      }

      const totalPago = c.pagamentos.reduce(
        (s, p) => s + Number(p.valor_recebido),
        0
      );
      const totalContrato = c.pagamentos.reduce(
        (s, p) => s + Number(p.valor_total),
        0
      );

      const allParcelas = c.pagamentos.flatMap((p) => p.parcelas);
      const paidCount = allParcelas.filter((p) => p.status === "pago").length;
      const totalParcelas = allParcelas.length;

      const proxVencimento = allParcelas
        .filter((p) => p.status === "pendente" || p.status === "atrasado")
        .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime())[0];

      const status =
        totalContrato === 0
          ? "Pendente"
          : totalPago >= totalContrato
          ? "Pago"
          : totalPago > 0
          ? "Parcial"
          : "Pendente";

      return {
        id: c.id,
        client: c.clientes.nome,
        eventType: c.eventos.tipo_evento,
        services: servicos,
        totalValue: fmt(totalContrato),
        downPayment: fmt(totalPago),
        installments: `${paidCount}/${totalParcelas}`,
        nextDueDate: proxVencimento
          ? new Date(proxVencimento.vencimento).toLocaleDateString("pt-BR")
          : "—",
        status,
        hasCombo: servicos.length > 1,
        installmentList: allParcelas.map((p, i) => ({
          number: `${i + 1}/${totalParcelas}`,
          dueDate: new Date(p.vencimento).toLocaleDateString("pt-BR"),
          value: fmt(Number(p.valor_parcela)),
          status: p.status === "pago" ? "Pago" : p.status === "atrasado" ? "Vencida" : "Pendente",
          receiptGenerated: p.status === "pago",
        })),
      };
    });

    const pagamentosData = pagamentosRecentes.map((p) => ({
      id: p.id,
      client: p.clientes.nome,
      method: p.forma_pagamento,
      value: fmt(Number(p.valor_recebido)),
      date: p.data_pagamento
        ? new Date(p.data_pagamento).toLocaleDateString("pt-BR")
        : "—",
      eventType: p.eventos.tipo_evento,
      services: [],
      installmentNumber: "—",
      remainingBalance: fmt(Number(p.valor_total) - Number(p.valor_recebido)),
    }));

    return NextResponse.json({
      ok: true,
      data: {
        summary: {
          receitaMes: fmt(Number(receitaMesResult._sum.valor_recebido ?? 0)),
          aReceber: fmt(Number(aReceberResult._sum.valor_total ?? 0)),
          parcelasPendentes,
        },
        contratos: contratosData,
        pagamentosRecentes: pagamentosData,
      },
    });
  } catch (error) {
    console.error("[GET /api/financeiro]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
