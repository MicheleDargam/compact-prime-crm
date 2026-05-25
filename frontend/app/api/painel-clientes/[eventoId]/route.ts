import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["lead", "proposta", "negociacao", "fechado", "cancelado"];
const VALID_EVENT_TYPES = ["Casamento", "Infantil", "Adulto", "Corporativo"];

function normalizeServiceType(tipo: string): string | null {
  const t = tipo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (t.includes("buffet")) return "buffet";
  if (t.includes("decora")) return "decoracao";
  if (t.includes("fotograf")) return "fotografia";
  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await params;

  const evento = await prisma.eventos.findFirst({
    where: { id: eventoId, deleted_at: null },
    include: {
      clientes: {
        include: {
          categorias_cliente: true,
          cliente_telefones: true,
        },
      },
      evento_servicos: {
        include: { servicos: true },
      },
      propostas: {
        where: { deleted_at: null },
        orderBy: { created_at: "desc" },
        take: 1,
        include: {
          proposta_servicos: {
            include: { servicos: true },
          },
        },
      },
    },
  });

  if (!evento) {
    return NextResponse.json({ ok: false, error: "Evento não encontrado." }, { status: 404 });
  }

  const cliente = evento.clientes;
  const tel = cliente.cliente_telefones;
  const telefone = Array.isArray(tel)
    ? ((tel as { principal: boolean; numero: string }[]).find((t) => t.principal)?.numero ??
       (tel as { numero: string }[])[0]?.numero ?? null)
    : (tel as { numero: string } | null)?.numero ?? null;

  const proposta = evento.propostas[0] ?? null;

  return NextResponse.json({
    ok: true,
    data: {
      eventoId: evento.id,
      clienteId: cliente.id,
      nome: cliente.nome,
      cpf: cliente.cpf ?? null,
      email: cliente.email ?? null,
      telefone,
      categoria: cliente.categorias_cliente?.nome ?? null,
      tipoEvento: evento.tipo_evento,
      dataEvento: evento.data_evento ? evento.data_evento.toISOString().split("T")[0] : null,
      observacoes: evento.observacoes ?? null,
      status: evento.status,
      servicos: evento.evento_servicos.map((es) => ({
        id: es.servicos.id,
        tipo: es.servicos.tipo,
        tipoNormalizado: normalizeServiceType(es.servicos.tipo),
        valorEstimado: Number(es.valor_estimado),
      })),
      proposta: proposta
        ? {
            id: proposta.id,
            status: proposta.status,
            valorTotal: Number(proposta.valor_total),
            descontoTotal: Number(proposta.desconto_total),
            validadeDias: proposta.validade_dias,
            criadaEm: proposta.created_at.toISOString(),
            servicos: proposta.proposta_servicos.map((ps) => ({
              tipo: ps.servicos.tipo,
              valorFinal: Number(ps.valor_final),
            })),
          }
        : null,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await params;

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  const { status } = body;
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ ok: false, error: "Status inválido." }, { status: 400 });
  }

  try {
    await prisma.eventos.update({
      where: { id: eventoId },
      data: { status, updated_at: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ ok: false, error: "Evento não encontrado." }, { status: 404 });
    }
    throw err;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  const { nome, email, cpf, telefone, categoria, tipoEvento, dataEvento, observacoes, servicos, servicoDetails } =
    body as Record<string, unknown>;

  if (!nome || typeof nome !== "string" || !nome.trim()) {
    return NextResponse.json({ ok: false, error: "Nome é obrigatório." }, { status: 400 });
  }

  const cpfLimpo = cpf && typeof cpf === "string" ? cpf.replace(/\D/g, "") || null : null;
  if (cpfLimpo && cpfLimpo.length !== 11 && cpfLimpo.length !== 14) {
    return NextResponse.json({ ok: false, error: "CPF inválido." }, { status: 400 });
  }

  const tipoEvtSafe =
    typeof tipoEvento === "string" && tipoEvento.trim() ? tipoEvento.trim() : "Casamento";
  if (!VALID_EVENT_TYPES.includes(tipoEvtSafe)) {
    return NextResponse.json({ ok: false, error: "Tipo de evento inválido." }, { status: 400 });
  }

  let dataEvtSafe: Date | null = null;
  if (dataEvento && typeof dataEvento === "string" && dataEvento.trim()) {
    const parsed = new Date(dataEvento);
    if (isNaN(parsed.getTime())) {
      return NextResponse.json({ ok: false, error: "Data do evento inválida." }, { status: 400 });
    }
    dataEvtSafe = parsed;
  }

  const servicosArray: string[] = Array.isArray(servicos)
    ? (servicos as unknown[]).filter((s): s is string => typeof s === "string")
    : [];

  try {
    const evento = await prisma.eventos.findFirst({
      where: { id: eventoId, deleted_at: null },
    });
    if (!evento) {
      return NextResponse.json({ ok: false, error: "Evento não encontrado." }, { status: 404 });
    }

    let categoriaRecord = null;
    if (categoria && typeof categoria === "string") {
      categoriaRecord = await prisma.categorias_cliente
        .findFirst({ where: { nome: categoria, deleted_at: null } })
        .catch(() => null);
    }

    const servicosAtivos = await prisma.servicos.findMany({
      where: { ativo: true },
      select: { id: true, tipo: true },
    });

    await prisma.$transaction(async (tx) => {
      const emailSafe = email && typeof email === "string" ? email.trim().toLowerCase() || null : null;

      await tx.clientes.update({
        where: { id: evento.cliente_id },
        data: {
          nome: nome.trim(),
          cpf: cpfLimpo,
          email: emailSafe,
          ...(typeof observacoes === "string"
            ? { observacoes: observacoes.trim() || null }
            : {}),
          ...(categoriaRecord ? { categoria_cliente_id: categoriaRecord.id } : {}),
          updated_at: new Date(),
        },
      });

      const telefoneFormatado =
        telefone && typeof telefone === "string" ? telefone.trim() : null;
      if (telefoneFormatado !== null) {
        const existing = await tx.cliente_telefones.findFirst({
          where: { cliente_id: evento.cliente_id, principal: true },
        });
        if (existing) {
          if (telefoneFormatado) {
            await tx.cliente_telefones.update({
              where: { id: existing.id },
              data: { numero: telefoneFormatado, updated_at: new Date() },
            });
          }
        } else if (telefoneFormatado) {
          await tx.cliente_telefones.create({
            data: {
              cliente_id: evento.cliente_id,
              numero: telefoneFormatado,
              tipo: "celular",
              principal: true,
            },
          });
        }
      }

      await tx.eventos.update({
        where: { id: eventoId },
        data: {
          tipo_evento: tipoEvtSafe,
          nome_evento: `${tipoEvtSafe} — ${nome.trim()}`,
          data_evento: dataEvtSafe,
          ...(typeof observacoes === "string"
            ? { observacoes: observacoes.trim() || null }
            : {}),
          updated_at: new Date(),
        },
      });

      const detailsMap = servicoDetails && typeof servicoDetails === "object"
        ? (servicoDetails as Record<string, { valorEstimado?: number; observacoes?: string | null }>)
        : {};

      await tx.evento_servicos.deleteMany({ where: { evento_id: eventoId } });
      for (const svcType of servicosArray) {
        const match = servicosAtivos.find((s) => normalizeServiceType(s.tipo) === svcType);
        if (!match) continue;
        const detail = detailsMap[svcType];
        await tx.evento_servicos.create({
          data: {
            evento_id: eventoId,
            servico_id: match.id,
            valor_estimado: detail?.valorEstimado ?? 0,
            observacoes: detail?.observacoes ?? null,
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "CPF já cadastrado para outro cliente." },
        { status: 409 }
      );
    }
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json(
        { ok: false, error: "Registro não encontrado." },
        { status: 404 }
      );
    }
    console.error("[PUT /api/painel-clientes/:eventoId]", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Erro interno ao editar." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await params;
  const action = new URL(request.url).searchParams.get("action") ?? "arquivar";

  if (!["arquivar", "excluir"].includes(action)) {
    return NextResponse.json(
      { ok: false, error: "Ação inválida. Use arquivar ou excluir." },
      { status: 400 }
    );
  }

  try {
    if (action === "arquivar") {
      await prisma.eventos.update({
        where: { id: eventoId },
        data: { deleted_at: new Date(), updated_at: new Date() },
      });
    } else {
      const evento = await prisma.eventos.findFirst({
        where: { id: eventoId, deleted_at: null },
      });
      if (!evento) {
        return NextResponse.json(
          { ok: false, error: "Evento não encontrado." },
          { status: 404 }
        );
      }
      await prisma.$transaction(async (tx) => {
        await tx.eventos.update({
          where: { id: eventoId },
          data: { deleted_at: new Date(), updated_at: new Date() },
        });
        await tx.clientes.update({
          where: { id: evento.cliente_id },
          data: { deleted_at: new Date(), updated_at: new Date() },
        });
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json(
        { ok: false, error: "Evento não encontrado." },
        { status: 404 }
      );
    }
    console.error(
      `[DELETE /api/painel-clientes/:eventoId?action=${action}]`,
      (err as Error).message
    );
    return NextResponse.json(
      { ok: false, error: "Erro interno ao processar a solicitação." },
      { status: 500 }
    );
  }
}
