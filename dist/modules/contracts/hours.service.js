import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import { payoutAfterFee, hoursTotal } from '../../utils/money.js';
import { requirePartyContract } from './contracts.service.js';
export async function logHours(contractId, freelancerId, data) {
    const contract = await requirePartyContract(contractId, freelancerId);
    if (contract.freelancerId !== freelancerId)
        throw new HttpError(403, 'Only the freelancer can log hours');
    if (contract.status !== 'ACTIVE')
        throw new HttpError(409, 'This contract is not active');
    if (contract.type !== 'HOURLY')
        throw new HttpError(409, 'Hours only apply to hourly contracts');
    return prisma.timeEntry.create({ data: { ...data, contractId } });
}
export async function removeEntry(entryId, freelancerId) {
    const entry = await prisma.timeEntry.findUnique({ where: { id: entryId }, include: { contract: true } });
    if (!entry)
        throw new HttpError(404, 'Time entry not found');
    if (entry.contract.freelancerId !== freelancerId) {
        throw new HttpError(403, 'Only the freelancer can remove their hours');
    }
    if (entry.status !== 'LOGGED')
        throw new HttpError(409, 'Paid hours cannot be removed');
    await prisma.timeEntry.delete({ where: { id: entryId } });
}
export async function payLoggedHours(contractId, clientId) {
    return prisma.$transaction(async (tx) => {
        const contract = await tx.contract.findUnique({
            where: { id: contractId },
            include: { timeEntries: { where: { status: 'LOGGED' } } },
        });
        if (!contract)
            throw new HttpError(404, 'Contract not found');
        if (contract.clientId !== clientId)
            throw new HttpError(403, 'Only the client can pay hours');
        if (contract.status !== 'ACTIVE')
            throw new HttpError(409, 'This contract is not active');
        if (contract.type !== 'HOURLY' || contract.hourlyRate == null) {
            throw new HttpError(409, 'This is not an hourly contract');
        }
        if (contract.timeEntries.length === 0)
            throw new HttpError(409, 'No unpaid hours to pay');
        const total = hoursTotal(contract.timeEntries, contract.hourlyRate);
        const client = await tx.user.findUniqueOrThrow({ where: { id: clientId } });
        if (client.walletBalance < total)
            throw new HttpError(402, 'Not enough funds in your wallet');
        await tx.user.update({ where: { id: clientId }, data: { walletBalance: { decrement: total } } });
        await tx.walletTransaction.create({
            data: { userId: clientId, amount: -total, reason: 'HOURLY_PAYOUT', contractId },
        });
        const net = payoutAfterFee(total);
        await tx.user.update({
            where: { id: contract.freelancerId },
            data: { walletBalance: { increment: net } },
        });
        await tx.walletTransaction.create({
            data: { userId: contract.freelancerId, amount: net, reason: 'HOURLY_PAYOUT', contractId },
        });
        await tx.user.update({ where: { id: clientId }, data: { totalSpent: { increment: total } } });
        await tx.timeEntry.updateMany({
            where: { contractId, status: 'LOGGED' },
            data: { status: 'PAID' },
        });
        return { paid: total, entries: contract.timeEntries.length };
    });
}
//# sourceMappingURL=hours.service.js.map