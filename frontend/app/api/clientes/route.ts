import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      { ok: false, error: "Erro ao buscar clientes" },
      { status: 500 }
    );
  }
}
