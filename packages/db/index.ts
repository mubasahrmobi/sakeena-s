import { PrismaClient } from "@prisma/client";

const g = globalThis as unknown as { prisma?: PrismaClient };
// The database can be far from the server, so give multi-step orders / stock updates more than Prisma's 5 s default.
export const prisma = g.prisma ?? new PrismaClient({ transactionOptions: { maxWait: 10000, timeout: 20000 } });
if (process.env.NODE_ENV !== "production") g.prisma = prisma;

export * from "./utils";
export * from "./stock";
