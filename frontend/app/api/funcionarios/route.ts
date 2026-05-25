import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const funcionarios = await prisma.funcionarios.findMany({
      where: { deleted_at: null, ativo: true },
      orderBy: { nome: "asc" },
    });
    return NextResponse.json({
      ok: true,
      data: funcionarios.map((f) => ({
        id: f.id,
        nome: f.nome,
        funcao: f.funcao,
        telefone: f.telefone ?? "",
        status: "Ativo" as const,
        disponibilidade: "Disponível" as const,
      })),
    });
  } catch (error) {
    console.error("[GET /api/funcionarios]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, funcao, telefone, email, tipoContratacao, valorDiaria, observacoes } = body;

    if (!nome?.trim() || !funcao?.trim()) {
      return NextResponse.json({ ok: false, error: "Nome e função são obrigatórios." }, { status: 400 });
    }

    const funcionario = await prisma.funcionarios.create({
      data: {
        nome: (nome as string).trim(),
        funcao: (funcao as string).trim(),
        telefone: telefone?.trim() || null,
        email: email?.trim() || null,
        tipo_contratacao: (tipoContratacao as string)?.trim() || "freelancer",
        valor_diaria: valorDiaria ? Number(valorDiaria) : null,
        observacoes: observacoes?.trim() || null,
      },
    });

    return NextResponse.json({ ok: true, data: funcionario }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ ok: false, error: "CPF já cadastrado." }, { status: 409 });
    }
    console.error("[POST /api/funcionarios]", error);
    return NextResponse.json({ ok: false, error: "Erro ao criar funcionário." }, { status: 500 });
  }
}
