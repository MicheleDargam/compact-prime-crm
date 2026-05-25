import { NextResponse } from "next/server";
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
      valor: Number(r.valor_pago),
      status: r.status_pagamento === "pago" ? "Pago" : r.status_pagamento === "parcial" ? "Parcial" : "Pendente",
    }));

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("[GET /api/funcionarios/registros]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
