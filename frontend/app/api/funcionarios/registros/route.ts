import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const registros = await prisma.evento_funcionarios.findMany({
      orderBy: { created_at: "desc" },
      take: 50,
      include: {
        funcionarios: true,
        eventos: true,
      },
    });

    const data = registros.map((r) => ({
      id: r.id,
      funcionario: r.funcionarios.nome,
      evento: r.eventos.nome_evento,
      funcao: r.funcao_evento,
      horas: 0,
      valor: Number(r.valor_pago),
      status: r.status_pagamento === "pago" ? "Pago" : r.status_pagamento === "parcial" ? "Parcial" : "Pendente",
    }));

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("[GET /api/funcionarios/registros]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, valor } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "id é obrigatório." }, { status: 400 });
    }

    const validStatuses = ["Pago", "Pendente", "Parcial"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ ok: false, error: "Status inválido." }, { status: 400 });
    }

    const statusDb = status === "Pago" ? "pago" : status === "Parcial" ? "parcial" : "pendente";

    await prisma.evento_funcionarios.update({
      where: { id },
      data: {
        ...(status ? { status_pagamento: statusDb } : {}),
        ...(valor !== undefined ? { valor_pago: Number(valor) } : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ ok: false, error: "Registro não encontrado." }, { status: 404 });
    }
    console.error("[PATCH /api/funcionarios/registros]", error);
    return NextResponse.json({ ok: false, error: "Erro ao atualizar pagamento." }, { status: 500 });
  }
}
