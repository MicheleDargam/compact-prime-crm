import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { descricao, categoria, fornecedor, valor, formaPagamento, observacoes, data } = body;

    if (!descricao?.trim() || !valor || !data) {
      return NextResponse.json({ ok: false, error: "Campos obrigatórios ausentes." }, { status: 400 });
    }

    const despesa = await prisma.despesas_buffet.create({
      data: {
        categoria: (categoria as string)?.trim() || "Operacional",
        descricao: (descricao as string).trim(),
        fornecedor: fornecedor?.trim() || null,
        valor: Number(valor),
        forma_pagamento: (formaPagamento as string)?.trim() || "pix",
        observacoes: observacoes?.trim() || null,
        data_despesa: new Date(data as string),
      },
    });

    return NextResponse.json({ ok: true, data: despesa }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/despesas-buffet]", error);
    return NextResponse.json({ ok: false, error: "Erro ao registrar despesa." }, { status: 500 });
  }
}
