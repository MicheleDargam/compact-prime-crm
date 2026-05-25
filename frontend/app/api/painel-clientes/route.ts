import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type {
  KanbanState,
  Lead,
  Column,
  ClientCategory,
  EventType,
} from "@/app/components/pipeline/pipeline-data";
import type { ServiceType } from "@/app/data/services";
import { COMBO_DISCOUNTS } from "@/app/data/services";

const COLUMN_DEFS: Omit<Column, "leadIds">[] = [
  { id: "col-novo", title: "Novo Cliente", color: "var(--gold-400)" },
  { id: "col-proposta", title: "Proposta Enviada", color: "var(--warning)" },
  { id: "col-negociacao", title: "Negociação", color: "#a78bfa" },
  { id: "col-fechado", title: "Fechado", color: "var(--success)" },
];

const STATUS_TO_COLUMN: Record<string, string> = {
  novo_cliente: "col-novo",
  lead: "col-novo",
  proposta: "col-proposta",
  negociacao: "col-negociacao",
  fechado: "col-fechado",
};

// Only these types appear in the kanban pipeline
const KANBAN_EVENT_TYPES = ["Casamento", "Infantil", "Adulto", "Corporativo"];

function normalizeServiceType(tipo: string): ServiceType | null {
  const t = tipo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (t.includes("buffet")) return "buffet";
  if (t.includes("decora")) return "decoracao";
  if (t.includes("fotograf")) return "fotografia";
  return null;
}

function formatCpf(cpf: string | null): string {
  if (!cpf) return "—";
  if (cpf.length === 11)
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  return cpf;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

const VALID_EVENT_TYPES: EventType[] = [
  "Casamento",
  "Infantil",
  "Adulto",
  "Corporativo",
];

export async function GET() {
  const eventos = await prisma.eventos.findMany({
    where: {
      deleted_at: null,
      tipo_evento: { in: KANBAN_EVENT_TYPES },
    },
    orderBy: { created_at: "desc" },
    include: {
      clientes: {
        include: {
          categorias_cliente: true,
          cliente_telefones: true,
        },
      },
      evento_servicos: {
        include: { servicos: true },
      },
    },
  });

  const leadsMap: Record<string, Lead> = {};
  const columnLeadIds: Record<string, string[]> = {
    "col-novo": [],
    "col-proposta": [],
    "col-negociacao": [],
    "col-fechado": [],
  };

  for (const evento of eventos) {
    const cliente = evento.clientes;
    const catNome = cliente.categorias_cliente?.nome ?? "";
    const clientCategory: ClientCategory = catNome.includes("VIP")
      ? "Cliente VIP"
      : catNome.includes("Prime")
      ? "Cliente Prime"
      : "Cliente Novo";

    const phone =
      Array.isArray(cliente.cliente_telefones)
        ? (cliente.cliente_telefones.find((t: { principal: boolean; numero: string }) => t.principal)?.numero ?? cliente.cliente_telefones[0]?.numero ?? "—")
        : (cliente.cliente_telefones as { principal: boolean; numero: string } | null)?.numero ?? "—";

    const cpf = formatCpf(cliente.cpf ?? null);

    const tipoRaw = evento.tipo_evento.trim();
    const eventType: EventType = VALID_EVENT_TYPES.includes(tipoRaw as EventType)
      ? (tipoRaw as EventType)
      : "Casamento";

    const servicosContratados: ServiceType[] = [];
    const valoresPorServico: { buffet?: number; decoracao?: number; fotografia?: number } = {};
    const observacoesPorServico: Record<string, string | null> = {};

    for (const es of evento.evento_servicos) {
      const tipo = normalizeServiceType(es.servicos.tipo);
      if (!tipo) continue;
      if (!servicosContratados.includes(tipo)) servicosContratados.push(tipo);
      const cents = Math.round(Number(es.valor_estimado) * 100);
      valoresPorServico[tipo] = (valoresPorServico[tipo] ?? 0) + cents;
      observacoesPorServico[tipo] = es.observacoes ?? null;
    }

    const subtotalCents = Object.values(valoresPorServico).reduce(
      (s, v) => s + (v ?? 0),
      0
    );
    const descontoCombo = COMBO_DISCOUNTS[servicosContratados.length] ?? 0;
    const totalCents = Math.round(subtotalCents * (1 - descontoCombo));

    const lead: Lead = {
      id: evento.id,
      cliente_id: cliente.id,
      name: cliente.nome,
      email: cliente.email ?? null,
      phone,
      cpf,
      eventType,
      data_evento: evento.data_evento ? evento.data_evento.toISOString().split("T")[0] : null,
      buffetTime: "5 horas",
      value: formatCurrency(totalCents),
      valueCents: totalCents,
      validity: "15 dias",
      notes: evento.observacoes ?? undefined,
      servicosContratados,
      valoresPorServico,
      observacoesPorServico,
      descontoCombo,
      subtotalCents,
      totalCents,
      clientCategory,
    };

    leadsMap[evento.id] = lead;
    const colId = STATUS_TO_COLUMN[evento.status] ?? "col-novo";
    if (colId in columnLeadIds) columnLeadIds[colId].push(evento.id);
  }

  const columns: Column[] = COLUMN_DEFS.map((def) => ({
    ...def,
    leadIds: columnLeadIds[def.id] ?? [],
  }));

  const state: KanbanState = { leads: leadsMap, columns };
  return NextResponse.json({ ok: true, data: state });
}
