import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ regraId: string }> }
) {
  const { regraId } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  const { name, discount, observations, active } = body;

  try {
    const updated = await prisma.regras_comerciais.update({
      where: { id: regraId },
      data: {
        ...(name !== undefined && { nome_campanha: (name as string).trim() }),
        ...(discount !== undefined && { percentual_desconto: Number(discount) }),
        ...(observations !== undefined && { observacoes: (observations as string | null) }),
        ...(active !== undefined && { status: active ? "ativa" : "inativa" }),
        updated_at: new Date(),
      },
    });
    return NextResponse.json({ ok: true, data: updated });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ ok: false, error: "Regra não encontrada." }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ regraId: string }> }
) {
  const { regraId } = await params;
  try {
    await prisma.regras_comerciais.delete({ where: { id: regraId } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ ok: false, error: "Regra não encontrada." }, { status: 404 });
    }
    throw err;
  }
}
