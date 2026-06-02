import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Previne múltiplas instâncias em desenvolvimento (Hot Reload do Next.js)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.POSTGRES_PRISMA_URL ??
    process.env.URL_PRISMA_POSTGRES ??
    process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString: connectionString!,
    max: 5,                // Máximo de conexões simultâneas
    idleTimeoutMillis: 30_000,   // Fecha conexão ociosa após 30s
    connectionTimeoutMillis: 15_000, // Timeout de conexão: 15s (cobre cold start do Supabase)
    ssl: { rejectUnauthorized: false }, // Supabase requer SSL
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
