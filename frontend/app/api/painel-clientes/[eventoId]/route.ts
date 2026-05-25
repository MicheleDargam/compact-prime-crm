import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["lead", "proposta", "negociacao", "fechado", "cancelado"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await params;

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  const { status } = body;
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ ok: false, error: "Status inválido." }, { status: 400 });
  }

  try {
    await prisma.eventos.update({
      where: { id: eventoId },
      data: { status, updated_at: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ ok: false, error: "Evento não encontrado." }, { status: 404 });
    }
    throw err;
  }
}
