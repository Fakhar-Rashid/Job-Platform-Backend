import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import { payoutAfterFee } from '../../utils/money.js';
async function requireMilestone(id) {
    const milestone = await prisma.milestone.findUnique({ where: { id }, include: { contract: true } });
    if (!milestone)
        throw new HttpError(404, 'Milestone not found');
    return milestone;
}
function requireRole(milestone, userId, role) {
    const expected = role === 'client' ? milestone.contract.clientId : milestone.contract.freelancerId;
    if (expected !== userId)
        throw new HttpError(403, `Only the ${role} can do this`);
    if (milestone.contract.status !== 'ACTIVE')
        throw new HttpError(409, 'This contract is not active');
}
export async function addMilestone(contractId, clientId, data) {
    const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        include: { _count: { select: { milestones: true } } },
    });
    if (!contract)
        throw new HttpError(404, 'Contract not found');
    if (contract.clientId !== clientId)
        throw new HttpError(403, 'Only the client can add milestones');
    if (contract.status !== 'ACTIVE')
        throw new HttpError(409, 'This contract is not active');
    if (contract.type !== 'FIXED')
        throw new HttpError(409, 'Milestones only apply to fixed price contracts');
    return prisma.milestone.create({
        data: { ...data, contractId, order: contract._count.milestones },
    });
}
export async function updateMilestone(id, clientId, data) {
    const milestone = await requireMilestone(id);
    requireRole(milestone, clientId, 'client');
    if (milestone.status !== 'PENDING')
        throw new HttpError(409, 'Only unfunded milestones can be edited');
    return prisma.milestone.update({ where: { id }, data });
}
export async function deleteMilestone(id, clientId) {
    const milestone = await requireMilestone(id);
    requireRole(milestone, clientId, 'client');
    if (milestone.status !== 'PENDING')
        throw new HttpError(409, 'Only unfunded milestones can be removed');
    await prisma.milestone.delete({ where: { id } });
}
export async function fund(id, clientId) {
    return prisma.$transaction(async (tx) => {
        const milestone = await tx.milestone.findUnique({ where: { id }, include: { contract: true } });
        if (!milestone)
            throw new HttpError(404, 'Milestone not found');
        if (milestone.contract.clientId !== clientId)
            throw new HttpError(403, 'Only the client can fund');
        if (milestone.contract.status !== 'ACTIVE')
            throw new HttpError(409, 'This contract is not active');
        if (milestone.status !== 'PENDING')
            throw new HttpError(409, 'This milestone is already funded');
        const client = await tx.user.findUniqueOrThrow({ where: { id: clientId } });
        if (client.walletBalance < milestone.amount) {
            throw new HttpError(402, 'Not enough funds in your wallet');
        }
        await tx.user.update({
            where: { id: clientId },
            data: { walletBalance: { decrement: milestone.amount } },
        });
        await tx.walletTransaction.create({
            data: {
                userId: clientId,
                amount: -milestone.amount,
                reason: 'ESCROW_FUND',
                contractId: milestone.contractId,
            },
        });
        return tx.milestone.update({ where: { id }, data: { status: 'FUNDED' } });
    });
}
export async function submit(id, freelancerId, message) {
    const milestone = await requireMilestone(id);
    requireRole(milestone, freelancerId, 'freelancer');
    if (!['FUNDED', 'CHANGES_REQUESTED'].includes(milestone.status)) {
        throw new HttpError(409, 'This milestone is not ready for submission');
    }
    return prisma.milestone.update({
        where: { id },
        data: { status: 'SUBMITTED', submissionMessage: message, submittedAt: new Date() },
    });
}
export async function requestChanges(id, clientId, note) {
    const milestone = await requireMilestone(id);
    requireRole(milestone, clientId, 'client');
    if (milestone.status !== 'SUBMITTED')
        throw new HttpError(409, 'Nothing has been submitted to review');
    return prisma.milestone.update({
        where: { id },
        data: { status: 'CHANGES_REQUESTED', changeRequest: note },
    });
}
export async function approve(id, clientId) {
    return prisma.$transaction(async (tx) => {
        const milestone = await tx.milestone.findUnique({ where: { id }, include: { contract: true } });
        if (!milestone)
            throw new HttpError(404, 'Milestone not found');
        if (milestone.contract.clientId !== clientId)
            throw new HttpError(403, 'Only the client can approve');
        if (milestone.status !== 'SUBMITTED')
            throw new HttpError(409, 'Nothing has been submitted to approve');
        const net = payoutAfterFee(milestone.amount);
        await tx.user.update({
            where: { id: milestone.contract.freelancerId },
            data: { walletBalance: { increment: net } },
        });
        await tx.walletTransaction.create({
            data: {
                userId: milestone.contract.freelancerId,
                amount: net,
                reason: 'MILESTONE_PAYOUT',
                contractId: milestone.contractId,
            },
        });
        await tx.user.update({
            where: { id: clientId },
            data: { totalSpent: { increment: milestone.amount } },
        });
        return tx.milestone.update({ where: { id }, data: { status: 'APPROVED', approvedAt: new Date() } });
    });
}
//# sourceMappingURL=milestones.service.js.map