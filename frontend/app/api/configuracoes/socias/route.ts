import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const socias = await prisma.$queryRaw<
      Array<{
        id: string;
        nome: string;
        cargo: string;
        email: string | null;
        telefone: string | null;
        percentual: number;
        ordem: number;
      }>
    >`SELECT id, nome, cargo, email, telefone, percentual, ordem FROM socias ORDER BY ordem ASC`;

    return NextResponse.json({ ok: true, data: socias });
  } catch (error) {
    console.error("[GET /api/configuracoes/socias]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as Array<{
      id?: string;
      nome: string;
      cargo: string;
      email?: string | null;
      telefone?: string | null;
      percentual?: number;
      ordem?: number;
    }>;

    if (!Array.isArray(body)) {
      return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
    }

    // Upsert each socia
    for (let i = 0; i < body.length; i++) {
      const s = body[i];
      const nome = s.nome?.trim() || null;
      const cargo = s.cargo?.trim() || null;
      const email = s.email?.trim() || null;
      const telefone = s.telefone?.trim() || null;
      const percentual = s.percentual ?? 50;
      const ordem = s.ordem ?? i;

      if (!nome || !cargo) continue;

      if (s.id) {
        await prisma.$executeRaw`
          UPDATE socias SET
            nome = ${nome}, cargo = ${cargo}, email = ${email},
            telefone = ${telefone}, percentual = ${percentual},
            ordem = ${ordem}, updated_at = NOW()
          WHERE id = ${s.id}::uuid
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO socias (nome, cargo, email, telefone, percentual, ordem)
          VALUES (${nome}, ${cargo}, ${email}, ${telefone}, ${percentual}, ${ordem})
        `;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PUT /api/configuracoes/socias]", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
