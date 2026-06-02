import { prisma } from './lib/prisma';

async function main() {
  try {
    console.log("Tentando conectar...");
    const count = await prisma.clientes.count();
    console.log("Conectado! Clientes:", count);
  } catch (e) {
    console.error("Erro Prisma:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
