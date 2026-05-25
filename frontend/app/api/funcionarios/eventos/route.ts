import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const eventos = await prisma.eventos.findMany({
      where: { deleted_at: null },
      orderBy: { data_evento: "desc" },
      take: 40,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventoId, funcionarioId, funcaoEvento } = body;

    if (!eventoId || !funcionarioId) {
      return NextResponse.json({ ok: false, error: "eventoId e funcionarioId são obrigatórios." }, { status: 400 });
    }

    const funcionario = await prisma.funcionarios.findFirst({
      where: { id: funcionarioId, deleted_at: null, ativo: true },
    });
    if (!funcionario) {
      return NextResponse.json({ ok: false, error: "Funcionário não encontrado." }, { status: 404 });
    }

    const record = await prisma.evento_funcionarios.create({
      data: {
        evento_id: eventoId,
        funcionario_id: funcionarioId,
        funcao_evento: (funcaoEvento as string)?.trim() || funcionario.funcao,
        valor_pago: funcionario.valor_diaria ?? 0,
        status_pagamento: "pendente",
      },
    });

    return NextResponse.json({ ok: true, data: record }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ ok: false, error: "Este funcionário já está escalado neste evento." }, { status: 409 });
    }
    console.error("[POST /api/funcionarios/eventos]", error);
    return NextResponse.json({ ok: false, error: "Erro ao escalar funcionário." }, { status: 500 });
  }
}
