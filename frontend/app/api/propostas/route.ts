import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMBO_DISCOUNTS } from "@/app/data/services";

const KANBAN_EVENT_TYPES = ["Casamento", "Infantil", "Adulto", "Corporativo"];

function normalizeServiceType(tipo: string): string | null {
  const t = tipo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (t.includes("buffet")) return "buffet";
  if (t.includes("decora")) return "decoracao";
  if (t.includes("fotograf")) return "fotografia";
  return null;
}

function mapStatus(dbStatus: string): string {
  if (dbStatus === "proposta") return "Enviada";
  if (dbStatus === "negociacao") return "Em negociação";
  if (dbStatus === "fechado") return "Aprovada";
  return "Em negociação";
}

export async function GET() {
  try {
    const [eventos, config] = await Promise.all([
      prisma.eventos.findMany({
        where: {
          deleted_at: null,
          status: { in: ["proposta", "negociacao", "fechado"] },
          tipo_evento: { in: KANBAN_EVENT_TYPES },
        },
        orderBy: { created_at: "desc" },
        include: {
          clientes: true,
          evento_servicos: {
            include: { servicos: true },
          },
        },
      }),
      prisma.configuracoes_empresa.findFirst({ where: { id: "singleton" }, select: { validade_proposta: true } }).catch(() => null),
    ]);

    const validadeProposta = config?.validade_proposta ?? "15 dias";

    let enviadas = 0;
    let negociacao = 0;
    let aprovadas = 0;

    const data = eventos.map((e) => {
      const servicosContratados: string[] = [];
      const valoresPorServico: Record<string, number> = {};

      for (const es of e.evento_servicos) {
        const tipo = normalizeServiceType(es.servicos.tipo);
        if (!tipo) continue;
        if (!servicosContratados.includes(tipo)) servicosContratados.push(tipo);
        const cents = Math.round(Number(es.valor_estimado) * 100);
        valoresPorServico[tipo] = (valoresPorServico[tipo] ?? 0) + cents;
      }

      const subtotalCents = Object.values(valoresPorServico).reduce((s, v) => s + v, 0);
      const descontoCombo = COMBO_DISCOUNTS[servicosContratados.length] ?? 0;
      const totalCents = Math.round(subtotalCents * (1 - descontoCombo));

      const status = mapStatus(e.status);
      if (status === "Enviada") enviadas++;
      else if (status === "Em negociação") negociacao++;
      else if (status === "Aprovada") aprovadas++;

      const sendDate = e.created_at
        ? new Date(e.created_at).toLocaleDateString("pt-BR")
        : new Date().toLocaleDateString("pt-BR");

      return {
        id: e.id,
        client: e.clientes.nome,
        eventType: e.tipo_evento,
        sendDate,
        validity: validadeProposta,
        status,
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
      summary: { enviadas, negociacao, aprovadas, vencidas: 0 },
    });
  } catch (error) {
    console.error("[GET /api/propostas]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
