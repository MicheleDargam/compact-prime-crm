import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      novosClientes,
      novosClientesMes,
      eventosAgendados,
      eventosAgendadosMes,
      propostasEnviadas,
      propostasEnviadasMes,
      followupsPendentes,
      followupsPendentesMes,
    ] = await Promise.all([
      prisma.eventos.count({ where: { status: "lead", deleted_at: null } }),
      prisma.eventos.count({ where: { status: "lead", deleted_at: null, created_at: { gte: startOfMonth } } }),
      prisma.eventos.count({ where: { data_evento: { not: null }, deleted_at: null } }),
      prisma.eventos.count({ where: { data_evento: { gte: startOfMonth }, deleted_at: null } }),
      prisma.propostas.count({ where: { status: "enviada", deleted_at: null } }),
      prisma.propostas.count({ where: { status: "enviada", deleted_at: null, created_at: { gte: startOfMonth } } }),
      prisma.eventos.count({ where: { status: "negociacao", deleted_at: null } }),
      prisma.eventos.count({ where: { status: "negociacao", deleted_at: null, created_at: { gte: startOfMonth } } }),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        novosClientes: { total: novosClientes, esteMes: novosClientesMes },
        eventosAgendados: { total: eventosAgendados, esteMes: eventosAgendadosMes },
        propostasEnviadas: { total: propostasEnviadas, esteMes: propostasEnviadasMes },
        followupsPendentes: { total: followupsPendentes, esteMes: followupsPendentesMes },
      },
    });
  } catch (error) {
    console.error("[GET /api/painel-clientes/kpis]", error);
    return NextResponse.json({ ok: false, error: "Erro ao buscar KPIs." }, { status: 500 });
  }
}
