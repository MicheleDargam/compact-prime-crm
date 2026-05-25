import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_EVENT_TYPES = ["Casamento", "Infantil", "Adulto", "Corporativo"] as const;

function normalizeServiceType(tipo: string): string | null {
  const t = tipo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (t.includes("buffet")) return "buffet";
  if (t.includes("decora")) return "decoracao";
  if (t.includes("fotograf")) return "fotografia";
  return null;
}

function err(error: string, details?: string, status = 400) {
  return NextResponse.json({ ok: false, error, details: details ?? null }, { status });
}

function prismaErrMessage(error: unknown): { error: string; details: string; status: number } | null {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  const e = error as { code: string; meta?: { target?: string[]; cause?: string } };

  if (e.code === "P2002") {
    const field = e.meta?.target?.join(", ") ?? "campo";
    return {
      error: field.includes("cpf")
        ? "CPF já cadastrado para outro cliente."
        : `Valor duplicado no campo "${field}".`,
      details: `Unique constraint — ${field}`,
      status: 409,
    };
  }

  if (e.code === "P2003") {
    return {
      error: "Referência inválida: registro relacionado não encontrado.",
      details: `Foreign key constraint — ${e.meta?.cause ?? "unknown field"}`,
      status: 422,
    };
  }

  if (e.code === "P2025") {
    return {
      error: "Registro não encontrado para realizar a operação.",
      details: "P2025 — record not found",
      status: 404,
    };
  }

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
    return NextResponse.json({ ok: false, error: "Erro ao buscar clientes.", details: null }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return err("Requisição inválida: corpo JSON malformado.", "JSON parse error");
  }

  const { nome, cpf, telefone, categoria, observacoes, tipoEvento, dataEvento, servicos } = body as Record<string, unknown>;

  // ── Validações de entrada ────────────────────────────────────────────────────

  if (!nome || typeof nome !== "string" || !nome.trim()) {
    return err("Nome do cliente é obrigatório.");
  }

  const cpfLimpo = cpf && typeof cpf === "string" ? cpf.replace(/\D/g, "") || null : null;
  if (cpfLimpo && cpfLimpo.length !== 11 && cpfLimpo.length !== 14) {
    return err("CPF inválido: deve conter 11 dígitos (CPF) ou 14 dígitos (CNPJ).", `CPF fornecido com ${cpfLimpo.length} dígitos`);
  }

  const telefoneFormatado = telefone && typeof telefone === "string" ? telefone.trim() : null;
  if (telefoneFormatado) {
    const digits = telefoneFormatado.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) {
      return err("Telefone inválido: deve ter entre 8 e 15 dígitos.", `Dígitos encontrados: ${digits.length}`);
    }
  }

  const tipoEvtSafe = typeof tipoEvento === "string" && tipoEvento.trim()
    ? tipoEvento.trim()
    : "Casamento";

  if (!VALID_EVENT_TYPES.includes(tipoEvtSafe as typeof VALID_EVENT_TYPES[number])) {
    return err(
      `Tipo de evento inválido: "${tipoEvtSafe}". Use Casamento, Infantil, Adulto ou Corporativo.`,
      `Received: ${tipoEvtSafe}`
    );
  }

  let dataEvtSafe: Date | null = null;
  if (dataEvento && typeof dataEvento === "string" && dataEvento.trim()) {
    const parsed = new Date(dataEvento);
    if (isNaN(parsed.getTime())) {
      return err("Data do evento inválida.", `Received: ${dataEvento}`);
    }
    dataEvtSafe = parsed;
  }

  const servicosArray: string[] = Array.isArray(servicos)
    ? (servicos as unknown[]).filter((s): s is string => typeof s === "string")
    : [];

  // ── Buscar categoria ─────────────────────────────────────────────────────────

  let categoriaRecord = await prisma.categorias_cliente.findFirst({
    where: { nome: typeof categoria === "string" ? categoria : "Cliente Novo", deleted_at: null },
  }).catch(() => null);

  if (!categoriaRecord) {
    categoriaRecord = await prisma.categorias_cliente.findFirst({
      where: { deleted_at: null },
      orderBy: { prioridade: "asc" },
    }).catch(() => null);
  }

  if (!categoriaRecord) {
    console.error("[POST /api/clientes] Nenhuma categoria encontrada no banco.");
    return err(
      "Não foi possível atribuir uma categoria ao cliente. Verifique as categorias cadastradas.",
      "Nenhuma categoria ativa encontrada em categorias_cliente",
      422
    );
  }

  // ── Transação principal ──────────────────────────────────────────────────────

  try {
    const cliente = await prisma.$transaction(async (tx) => {
      // 1. Criar cliente
      const newCliente = await tx.clientes.create({
        data: {
          nome: nome.trim(),
          cpf: cpfLimpo,
          observacoes: typeof observacoes === "string" ? observacoes.trim() || null : null,
          origem: "CRM",
          categoria_cliente_id: categoriaRecord!.id,
          ...(telefoneFormatado
            ? {
                cliente_telefones: {
                  create: { numero: telefoneFormatado, tipo: "celular", principal: true },
                },
              }
            : {}),
        },
        include: {
          categorias_cliente: true,
          cliente_telefones: true,
        },
      });

      // 2. Buscar serviços ativos (somente se necessário)
      const servicosAtivos =
        servicosArray.length > 0
          ? await tx.servicos.findMany({ where: { ativo: true }, select: { id: true, tipo: true } })
          : [];

      // 3. Criar evento
      const evento = await tx.eventos.create({
        data: {
          cliente_id: newCliente.id,
          tipo_evento: tipoEvtSafe,
          nome_evento: `${tipoEvtSafe} — ${newCliente.nome}`,
          data_evento: dataEvtSafe,
          status: "lead",
          observacoes: typeof observacoes === "string" ? observacoes.trim() || null : null,
        },
      });

      // 4. Vincular serviços ao evento
      for (const svcType of servicosArray) {
        const match = servicosAtivos.find((s) => normalizeServiceType(s.tipo) === svcType);
        if (!match) {
          console.warn(`[POST /api/clientes] Serviço não encontrado para tipo: ${svcType}`);
          continue;
        }
        await tx.evento_servicos.create({
          data: { evento_id: evento.id, servico_id: match.id, valor_estimado: 0 },
        });
      }

      return newCliente;
    });

    return NextResponse.json({ ok: true, data: cliente }, { status: 201 });
  } catch (error) {
    const prismaErr = prismaErrMessage(error);
    if (prismaErr) {
      return NextResponse.json(
        { ok: false, error: prismaErr.error, details: prismaErr.details },
        { status: prismaErr.status }
      );
    }

    console.error("[POST /api/clientes] Erro inesperado:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { ok: false, error: "Erro interno ao criar cliente. Tente novamente.", details: error instanceof Error ? error.message : null },
      { status: 500 }
    );
  }
}
