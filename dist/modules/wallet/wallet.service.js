import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import { WALLET_TOPUP_AMOUNT } from '../../config/env.js';
export async function getWallet(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new HttpError(404, 'User not found');
    const transactions = await prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
    return { balance: user.walletBalance, transactions };
}
export async function topUp(userId) {
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
            where: { id: userId },
            data: { walletBalance: { increment: WALLET_TOPUP_AMOUNT } },
        });
        await tx.walletTransaction.create({
            data: { userId, amount: WALLET_TOPUP_AMOUNT, reason: 'TOPUP' },
        });
        return { balance: user.walletBalance, added: WALLET_TOPUP_AMOUNT };
    });
}
//# sourceMappingURL=wallet.service.js.map