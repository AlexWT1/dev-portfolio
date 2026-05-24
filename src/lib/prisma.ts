import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

let prismaInstance: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    const globalForPrisma = globalThis as unknown as {
      prisma: PrismaClient | undefined;
    };

    if (!globalForPrisma.prisma) {
      const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
      });

      globalForPrisma.prisma = new PrismaClient({ adapter });
    }

    prismaInstance = globalForPrisma.prisma;
  }
  return prismaInstance;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as any)[prop];
  },
});
