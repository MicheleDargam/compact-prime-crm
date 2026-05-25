import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const regras = await prisma.regras_comerciais.findMany({
      orderBy: { created_at: "desc" },
      include: {
        categorias_cliente: true,
        combos: true,
      },
    });

    const data = regras.map((r) => ({
      id: r.id,
      name: r.nome_campanha,
      clientCategory: r.categorias_cliente.nome,
      discount: Number(r.percentual_desconto),
      active: r.status === "ativa",
      observations: r.observacoes ?? "",
      dataInicio: r.data_inicio ? new Date(r.data_inicio).toLocaleDateString("pt-BR") : null,
      dataFim: r.data_fim ? new Date(r.data_fim).toLocaleDateString("pt-BR") : null,
      combo: r.combos?.nome ?? null,
    }));

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("[GET /api/configuracoes/regras]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, clientCategory, discount, observations, dataInicio, dataFim } = body;

    if (!name?.trim() || !clientCategory?.trim()) {
      return NextResponse.json({ ok: false, error: "Nome e categoria são obrigatórios." }, { status: 400 });
    }

    const categoria = await prisma.categorias_cliente.findFirst({
      where: { nome: clientCategory, deleted_at: null },
    });

    if (!categoria) {
      return NextResponse.json({ ok: false, error: "Categoria não encontrada." }, { status: 422 });
    }

    const regra = await prisma.regras_comerciais.create({
      data: {
        nome_campanha: (name as string).trim(),
        categoria_cliente_id: categoria.id,
        percentual_desconto: Number(discount ?? 0),
        status: "ativa",
        observacoes: observations?.trim() || null,
        data_inicio: dataInicio ? new Date(dataInicio as string) : null,
        data_fim: dataFim ? new Date(dataFim as string) : null,
      },
    });

    return NextResponse.json({ ok: true, data: regra }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/configuracoes/regras]", error);
    return NextResponse.json({ ok: false, error: "Erro ao criar regra." }, { status: 500 });
  }
}
