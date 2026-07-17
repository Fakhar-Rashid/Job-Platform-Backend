import { PrismaClient } from '@prisma/client';
import { isProduction } from '../config/env.js';
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!isProduction)
    globalForPrisma.prisma = prisma;
//# sourceMappingURL=prisma.js.map