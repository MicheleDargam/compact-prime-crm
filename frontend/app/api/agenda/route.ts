import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
