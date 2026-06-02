import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<
      Array<{
        id: string;
        nome_fantasia: string | null;
        razao_social: string | null;
        cnpj: string | null;
        endereco: string | null;
        telefone: string | null;
        email: string | null;
        responsavel_legal: string | null;
        cargo_responsavel: string | null;
        assinatura_texto: string | null;
        slogan: string | null;
        validade_proposta: string | null;
        parcelamento_padrao: string | null;
        sinal_minimo: string | null;
        observacoes_financeiras: string | null;
      }>
    >`SELECT * FROM configuracoes_empresa WHERE id = 'singleton' LIMIT 1`;

    return NextResponse.json({ ok: true, data: rows[0] ?? {} });
  } catch (error) {
    console.error("[GET /api/configuracoes/empresa]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const {
      nome_fantasia = null,
      razao_social = null,
      cnpj = null,
      endereco = null,
      telefone = null,
      email = null,
      responsavel_legal = null,
      cargo_responsavel = null,
      assinatura_texto = null,
      slogan = null,
      validade_proposta = null,
      parcelamento_padrao = null,
      sinal_minimo = null,
      observacoes_financeiras = null,
    } = await request.json();

    await prisma.$executeRaw`
      INSERT INTO configuracoes_empresa
        (id, nome_fantasia, razao_social, cnpj, endereco, telefone, email,
         responsavel_legal, cargo_responsavel, assinatura_texto, slogan,
         validade_proposta, parcelamento_padrao, sinal_minimo, observacoes_financeiras,
         updated_at)
      VALUES
        ('singleton', ${nome_fantasia}, ${razao_social}, ${cnpj}, ${endereco},
         ${telefone}, ${email}, ${responsavel_legal}, ${cargo_responsavel},
         ${assinatura_texto}, ${slogan},
         ${validade_proposta}, ${parcelamento_padrao}, ${sinal_minimo}, ${observacoes_financeiras},
         NOW())
      ON CONFLICT (id) DO UPDATE SET
        nome_fantasia           = EXCLUDED.nome_fantasia,
        razao_social            = EXCLUDED.razao_social,
        cnpj                    = EXCLUDED.cnpj,
        endereco                = EXCLUDED.endereco,
        telefone                = EXCLUDED.telefone,
        email                   = EXCLUDED.email,
        responsavel_legal       = EXCLUDED.responsavel_legal,
        cargo_responsavel       = EXCLUDED.cargo_responsavel,
        assinatura_texto        = EXCLUDED.assinatura_texto,
        slogan                  = EXCLUDED.slogan,
        validade_proposta       = EXCLUDED.validade_proposta,
        parcelamento_padrao     = EXCLUDED.parcelamento_padrao,
        sinal_minimo            = EXCLUDED.sinal_minimo,
        observacoes_financeiras = EXCLUDED.observacoes_financeiras,
        updated_at              = NOW()
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PUT /api/configuracoes/empresa]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
