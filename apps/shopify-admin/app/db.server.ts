import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => new PrismaClient();

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as typeof globalThis & {
  prismaClient?: PrismaClientSingleton;
};

export const prisma = globalForPrisma.prismaClient ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaClient = prisma;
}
