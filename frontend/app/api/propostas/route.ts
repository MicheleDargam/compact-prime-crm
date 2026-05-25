import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeServiceType(tipo: string): string | null {
  const t = tipo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (t.includes("buffet")) return "buffet";
  if (t.includes("decora")) return "decoracao";
  if (t.includes("fotograf")) return "fotografia";
  return null;
}

function mapStatus(dbStatus: string): string {
  switch (dbStatus) {
    case "enviada": return "Enviada";
    case "aprovada": return "Aprovada";
    case "vencida":
    case "cancelada": return "Vencida";
    default: return "Em negociação";
  }
}

export async function GET() {
  try {
    const propostas = await prisma.propostas.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: "desc" },
      include: {
        clientes: true,
        eventos: true,
        proposta_servicos: { include: { servicos: true } },
      },
    });

    const [enviadas, negociacao, aprovadas, vencidas] = [
      propostas.filter((p) => p.status === "enviada").length,
      propostas.filter((p) => p.status === "rascunho" || p.status === "em_negociacao").length,
      propostas.filter((p) => p.status === "aprovada").length,
      propostas.filter((p) => p.status === "vencida" || p.status === "cancelada").length,
    ];

    const data = propostas.map((p) => {
      const servicosContratados: string[] = [];
      const valoresPorServico: Record<string, number> = {};

      for (const ps of p.proposta_servicos) {
        const tipo = normalizeServiceType(ps.servicos.tipo);
        if (!tipo) continue;
        if (!servicosContratados.includes(tipo)) servicosContratados.push(tipo);
        const cents = Math.round(Number(ps.valor_final) * 100);
        valoresPorServico[tipo] = (valoresPorServico[tipo] ?? 0) + cents;
      }

      const subtotalCents = Math.round(Number(p.valor_total) * 100);
      const descontoTotal = Math.round(Number(p.desconto_total) * 100);
      const totalCents = subtotalCents - descontoTotal;
      const descontoCombo = subtotalCents > 0 ? descontoTotal / subtotalCents : 0;

      const sendDate = p.enviada_em
        ? new Date(p.enviada_em).toLocaleDateString("pt-BR")
        : new Date(p.created_at).toLocaleDateString("pt-BR");

      return {
        id: p.id,
        client: p.clientes.nome,
        eventType: p.eventos.tipo_evento,
        sendDate,
        validity: `${p.validade_dias} dias`,
        status: mapStatus(p.status),
        servicosContratados,
        valoresPorServico,
        descontoCombo,
        subtotalCents,
        totalCents,
      };
    });

    return NextResponse.json({
      ok: true,
      data,
      summary: { enviadas, negociacao, aprovadas, vencidas },
    });
  } catch (error) {
    console.error("[GET /api/propostas]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
