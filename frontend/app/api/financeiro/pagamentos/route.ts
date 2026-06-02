import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventoId, clienteId, valorTotal, valorRecebido, formaPagamento, observacoes, dataPagamento, comprovante_url } = body;

    if (!eventoId || !clienteId || !valorTotal) {
      return NextResponse.json({ ok: false, error: "Campos obrigatórios ausentes." }, { status: 400 });
    }

    const pagamento = await prisma.pagamentos.create({
      data: {
        cliente_id: clienteId,
        evento_id: eventoId,
        tipo_pagamento: "avulso",
        valor_total: Number(valorTotal),
        valor_recebido: Number(valorRecebido ?? 0),
        status: Number(valorRecebido) >= Number(valorTotal) ? "pago" : "parcial",
        forma_pagamento: formaPagamento ?? "pix",
        observacoes: observacoes ?? null,
        data_pagamento: dataPagamento ? new Date(dataPagamento) : new Date(),
        comprovante_url: comprovante_url ?? null,
      },
    });

    return NextResponse.json({ ok: true, data: pagamento }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/financeiro/pagamentos]", error);
    return NextResponse.json({ ok: false, error: "Erro ao registrar pagamento." }, { status: 500 });
  }
}
