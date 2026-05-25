import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ funcionarioId: string }> }
) {
  const { funcionarioId } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  const { nome, funcao, telefone, email, tipoContratacao, valorDiaria, observacoes, ativo } = body;

  try {
    const updated = await prisma.funcionarios.update({
      where: { id: funcionarioId, deleted_at: null },
      data: {
        ...(nome !== undefined && { nome: (nome as string).trim() }),
        ...(funcao !== undefined && { funcao: (funcao as string).trim() }),
        ...(telefone !== undefined && { telefone: (telefone as string | null) }),
        ...(email !== undefined && { email: (email as string | null) }),
        ...(tipoContratacao !== undefined && { tipo_contratacao: tipoContratacao as string }),
        ...(valorDiaria !== undefined && { valor_diaria: valorDiaria !== null ? Number(valorDiaria) : null }),
        ...(observacoes !== undefined && { observacoes: observacoes as string | null }),
        ...(ativo !== undefined && { ativo: Boolean(ativo) }),
        updated_at: new Date(),
      },
    });
    return NextResponse.json({ ok: true, data: updated });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ ok: false, error: "Funcionário não encontrado." }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ funcionarioId: string }> }
) {
  const { funcionarioId } = await params;
  try {
    await prisma.funcionarios.update({
      where: { id: funcionarioId },
      data: { deleted_at: new Date(), ativo: false },
    });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ ok: false, error: "Funcionário não encontrado." }, { status: 404 });
    }
    throw err;
  }
}
