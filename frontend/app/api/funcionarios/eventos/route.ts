import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const eventos = await prisma.eventos.findMany({
      where: { deleted_at: null, evento_funcionarios: { some: {} } },
      orderBy: { data_evento: "desc" },
      take: 20,
      include: {
        clientes: true,
        evento_funcionarios: {
          include: { funcionarios: true },
        },
      },
    });

    const data = eventos.map((ev) => ({
      id: ev.id,
      nome: ev.nome_evento,
      data: ev.data_evento
        ? new Date(ev.data_evento).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            weekday: "long",
          })
        : "Data não definida",
      colaboradores: ev.evento_funcionarios.map((ef) => ({
        id: ef.funcionario_id,
        nome: ef.funcionarios.nome,
        funcao: ef.funcao_evento || ef.funcionarios.funcao,
        valorPago: Number(ef.valor_pago),
        statusPagamento: ef.status_pagamento,
      })),
    }));

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("[GET /api/funcionarios/eventos]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
