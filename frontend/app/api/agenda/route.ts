import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { nomeCliente, tipoEvento, dataEvento, horario, observacoes } =
      await request.json() as {
        nomeCliente: string;
        tipoEvento: string;
        dataEvento: string;
        horario?: string;
        observacoes?: string;
      };

    if (!nomeCliente?.trim() || !tipoEvento?.trim() || !dataEvento?.trim()) {
      return NextResponse.json({ ok: false, error: "Nome, tipo e data são obrigatórios." }, { status: 400 });
    }

    const dataEvtParsed = new Date(dataEvento);
    if (isNaN(dataEvtParsed.getTime())) {
      return NextResponse.json({ ok: false, error: "Data inválida." }, { status: 400 });
    }

    let horarioParsed: Date | null = null;
    if (horario) {
      const [h, m] = horario.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        horarioParsed = new Date(1970, 0, 1, h, m, 0);
      }
    }

    // Find default category
    const categoria = await prisma.categorias_cliente.findFirst({
      where: { deleted_at: null },
      orderBy: { prioridade: "asc" },
    });

    if (!categoria) {
      return NextResponse.json({ ok: false, error: "Nenhuma categoria de cliente encontrada." }, { status: 422 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const cliente = await tx.clientes.create({
        data: {
          nome: nomeCliente.trim(),
          categoria_cliente_id: categoria.id,
          origem: "Agenda",
          observacoes: observacoes?.trim() || null,
        },
      });

      const evento = await tx.eventos.create({
        data: {
          cliente_id: cliente.id,
          tipo_evento: tipoEvento.trim(),
          nome_evento: `${tipoEvento.trim()} — ${cliente.nome}`,
          data_evento: dataEvtParsed,
          horario: horarioParsed,
          status: "lead",
          observacoes: observacoes?.trim() || null,
        },
      });

      return { clienteId: cliente.id, eventoId: evento.id };
    });

    return NextResponse.json({ ok: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/agenda]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}

function normalizeEventType(tipo: string): string {
  const t = tipo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (t.includes("casamento")) return "casamento";
  if (t.includes("infantil")) return "infantil";
  if (t.includes("corporativo")) return "corporativo";
  if (t.includes("adulto")) return "adulto";
  return "casamento";
}

function normalizeServiceType(tipo: string): string | null {
  const t = tipo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (t.includes("buffet")) return "buffet";
  if (t.includes("decora")) return "decoracao";
  if (t.includes("fotograf")) return "fotografia";
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()), 10);
    const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1), 10);

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0, 23, 59, 59);

    const eventos = await prisma.eventos.findMany({
      where: {
        data_evento: { gte: firstDay, lte: lastDay },
        deleted_at: null,
      },
      include: {
        clientes: true,
        evento_servicos: { include: { servicos: true } },
        evento_funcionarios: { select: { id: true } },
      },
      orderBy: { data_evento: "asc" },
    });

    const byDay: Record<number, object[]> = {};

    for (const ev of eventos) {
      if (!ev.data_evento) continue;
      const day = new Date(ev.data_evento).getUTCDate();

      const servicosContratados: string[] = [];
      for (const es of ev.evento_servicos) {
        const tipo = normalizeServiceType(es.servicos.tipo);
        if (tipo && !servicosContratados.includes(tipo)) servicosContratados.push(tipo);
      }

      let time = "—";
      if (ev.horario) {
        const h = new Date(ev.horario);
        time = `${String(h.getUTCHours()).padStart(2, "0")}:${String(h.getUTCMinutes()).padStart(2, "0")}`;
      }

      if (!byDay[day]) byDay[day] = [];
      byDay[day].push({
        id: ev.id,
        title: ev.clientes.nome,
        type: normalizeEventType(ev.tipo_evento),
        time,
        servicosContratados,
        statusOperacional: "Confirmado",
        colaboradoresCount: ev.evento_funcionarios.length,
      });
    }

    return NextResponse.json({ ok: true, data: { year, month, events: byDay } });
  } catch (error) {
    console.error("[GET /api/agenda]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
