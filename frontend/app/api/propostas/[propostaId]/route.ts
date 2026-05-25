import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["rascunho", "enviada", "em_negociacao", "aprovada", "vencida", "cancelada"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ propostaId: string }> }
) {
  const { propostaId } = await params;

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
    await prisma.propostas.update({
      where: { id: propostaId },
      data: { status, updated_at: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ ok: false, error: "Proposta não encontrada." }, { status: 404 });
    }
    throw err;
  }
}
