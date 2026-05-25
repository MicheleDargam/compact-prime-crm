import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  const { titulo, data, horario, observacoes } = body as Record<string, unknown>;

  if (!titulo || typeof titulo !== "string" || !titulo.trim()) {
    return NextResponse.json(
      { ok: false, error: "Título da reunião é obrigatório." },
      { status: 400 }
    );
  }

  if (!data || typeof data !== "string" || !data.trim()) {
    return NextResponse.json(
      { ok: false, error: "Data da reunião é obrigatória." },
      { status: 400 }
    );
  }

  const dateStr =
    horario && typeof horario === "string" ? `${data.trim()}T${horario.trim()}` : `${data.trim()}T00:00:00`;
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    return NextResponse.json(
      { ok: false, error: "Data ou horário inválidos." },
      { status: 400 }
    );
  }

  try {
    const evento = await prisma.eventos.findFirst({
      where: { id: eventoId, deleted_at: null },
    });
    if (!evento) {
      return NextResponse.json({ ok: false, error: "Evento não encontrado." }, { status: 404 });
    }

    await prisma.eventos.create({
      data: {
        cliente_id: evento.cliente_id,
        tipo_evento: "Reunião",
        nome_evento: titulo.trim(),
        data_evento: parsed,
        status: "lead",
        observacoes: typeof observacoes === "string" ? observacoes.trim() || null : null,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: unknown) {
    console.error(
      "[POST /api/painel-clientes/:eventoId/reuniao]",
      (err as Error).message
    );
    return NextResponse.json(
      { ok: false, error: "Erro interno ao agendar reunião." },
      { status: 500 }
    );
  }
}
