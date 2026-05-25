import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeServiceType(tipo: string): string | null {
  const t = tipo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (t.includes("buffet")) return "buffet";
  if (t.includes("decora")) return "decoracao";
  if (t.includes("fotograf")) return "fotografia";
  return null;
}

export async function GET() {
  try {
    const clientes = await prisma.clientes.findMany({
      where: { deleted_at: null },
      include: {
        categorias_cliente: true,
        cliente_telefones: true,
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({ ok: true, data: clientes });
  } catch (error) {
    console.error("[GET /api/clientes]", error);
    return NextResponse.json(
      { ok: false, error: "Erro ao buscar clientes." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, cpf, telefone, categoria, observacoes, tipoEvento, dataEvento, servicos } = body;

    if (!nome?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Nome é obrigatório." },
        { status: 400 }
      );
    }

    let categoriaRecord = await prisma.categorias_cliente.findFirst({
      where: { nome: categoria ?? "Cliente Novo", deleted_at: null },
    });

    if (!categoriaRecord) {
      categoriaRecord = await prisma.categorias_cliente.findFirst({
        where: { deleted_at: null },
        orderBy: { prioridade: "asc" },
      });
    }

    if (!categoriaRecord) {
      return NextResponse.json(
        { ok: false, error: "Nenhuma categoria de cliente encontrada no banco." },
        { status: 422 }
      );
    }

    const cpfLimpo = cpf ? (cpf as string).replace(/\D/g, "") || null : null;
    const telefoneFormatado = telefone?.toString().trim() || null;
    const tipoEvtSafe = (tipoEvento as string)?.trim() || "Casamento";
    const dataEvtSafe = (dataEvento as string)?.trim()
      ? new Date(dataEvento as string)
      : null;
    const servicosArray: string[] = Array.isArray(servicos) ? servicos : [];

    const cliente = await prisma.$transaction(async (tx) => {
      const newCliente = await tx.clientes.create({
        data: {
          nome: (nome as string).trim(),
          cpf: cpfLimpo,
          observacoes: (observacoes as string)?.trim() || null,
          origem: "CRM",
          categoria_cliente_id: categoriaRecord!.id,
          ...(telefoneFormatado
            ? {
                cliente_telefones: {
                  create: {
                    numero: telefoneFormatado,
                    tipo: "celular",
                    principal: true,
                  },
                },
              }
            : {}),
        },
        include: {
          categorias_cliente: true,
          cliente_telefones: true,
        },
      });

      const servicosAtivos =
        servicosArray.length > 0
          ? await tx.servicos.findMany({
              where: { ativo: true },
              select: { id: true, tipo: true },
            })
          : [];

      const evento = await tx.eventos.create({
        data: {
          cliente_id: newCliente.id,
          tipo_evento: tipoEvtSafe,
          nome_evento: `${tipoEvtSafe} — ${newCliente.nome}`,
          data_evento: dataEvtSafe,
          status: "novo_cliente",
          observacoes: (observacoes as string)?.trim() || null,
        },
      });

      for (const svcType of servicosArray) {
        const match = servicosAtivos.find(
          (s) => normalizeServiceType(s.tipo) === svcType
        );
        if (match) {
          await tx.evento_servicos.create({
            data: {
              evento_id: evento.id,
              servico_id: match.id,
              valor_estimado: 0,
            },
          });
        }
      }

      return newCliente;
    });

    return NextResponse.json({ ok: true, data: cliente }, { status: 201 });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { ok: false, error: "CPF já cadastrado para outro cliente." },
        { status: 409 }
      );
    }
    console.error("[POST /api/clientes]", error);
    return NextResponse.json(
      { ok: false, error: "Erro ao criar cliente." },
      { status: 500 }
    );
  }
}
