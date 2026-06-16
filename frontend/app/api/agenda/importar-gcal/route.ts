import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listCalendarEvents } from "@/lib/google-calendar";

const LOTE = 30;

function detectarTipoEvento(titulo: string): string {
  const t = titulo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (t.includes("casamento") || t.includes("wedding")) return "Casamento";
  if (t.includes("infantil") || t.includes("crianca") || t.includes("criança") || t.includes("kids")) return "Infantil";
  if (t.includes("corporativo") || t.includes("empresa") || t.includes("corporate")) return "Corporativo";
  if (t.includes("adulto") || t.includes("aniversario") || t.includes("aniversário")) return "Adulto";
  return "Casamento";
}

function extrairNomeCliente(titulo: string): string {
  const partes = titulo.split(/\s*[—–-]\s*/);
  if (partes.length >= 2) return partes[partes.length - 1].trim();
  return titulo.trim();
}

export async function POST() {
  try {
    const gcalEvents = await listCalendarEvents();
    if (gcalEvents.length === 0) {
      return NextResponse.json({ ok: true, importados: 0, pulados: 0, temMais: false, mensagem: "Nenhum evento encontrado na agenda Google." });
    }

    const existentes = await prisma.eventos.findMany({
      where: { google_calendar_event_id: { not: null } },
      select: { google_calendar_event_id: true },
    });
    const idsExistentes = new Set(existentes.map(e => e.google_calendar_event_id));

    const categoria = await prisma.categorias_cliente.findFirst({
      where: { deleted_at: null },
      orderBy: { prioridade: "asc" },
    });
    if (!categoria) {
      return NextResponse.json({ ok: false, error: "Nenhuma categoria de cliente encontrada." }, { status: 422 });
    }

    const pendentes = gcalEvents.filter(ev => !idsExistentes.has(ev.id));
    const lote = pendentes.slice(0, LOTE);
    const temMais = pendentes.length > LOTE;

    let importados = 0;

    for (const ev of lote) {
      const dataEvento = new Date(ev.date + "T00:00:00");
      if (isNaN(dataEvento.getTime())) continue;

      let horario: Date | null = null;
      if (ev.dateTime) {
        const dt = new Date(ev.dateTime);
        if (!isNaN(dt.getTime())) {
          horario = new Date(1970, 0, 1, dt.getHours(), dt.getMinutes(), 0);
        }
      }

      const nomeCliente = extrairNomeCliente(ev.summary);
      const tipoEvento = detectarTipoEvento(ev.summary);

      await prisma.$transaction(async (tx) => {
        const cliente = await tx.clientes.create({
          data: {
            nome: nomeCliente,
            categoria_cliente_id: categoria.id,
            origem: "Google Calendar",
            observacoes: ev.description?.trim() || null,
          },
        });

        await tx.eventos.create({
          data: {
            cliente_id: cliente.id,
            tipo_evento: tipoEvento,
            nome_evento: ev.summary,
            data_evento: dataEvento,
            horario,
            status: "lead",
            observacoes: ev.description?.trim() || null,
            google_calendar_event_id: ev.id,
          },
        });
      });

      importados++;
    }

    const restantes = pendentes.length - importados;
    const mensagem = temMais
      ? `${importados} evento(s) importado(s). Ainda há ${restantes} para importar — clique novamente para continuar.`
      : `${importados} evento(s) importado(s) com sucesso. Tudo importado!`;

    return NextResponse.json({ ok: true, importados, temMais, mensagem });
  } catch (error) {
    console.error("[POST /api/agenda/importar-gcal]", error);
    return NextResponse.json({ ok: false, error: "Erro interno ao importar." }, { status: 500 });
  }
}
