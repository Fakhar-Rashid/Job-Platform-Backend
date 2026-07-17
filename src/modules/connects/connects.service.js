import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import { TOPUP_AMOUNT } from '../../config/env.js';

export async function getBalance(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(404, 'User not found');
  return { connectBalance: user.connectBalance };
}

export async function topUp(userId) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { connectBalance: { increment: TOPUP_AMOUNT } },
    });
    await tx.connectTransaction.create({
      data: { userId, amount: TOPUP_AMOUNT, reason: 'TOPUP' },
    });
    return { connectBalance: user.connectBalance, added: TOPUP_AMOUNT };
  });
}

export async function listTransactions(userId) {
  return prisma.connectTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}
