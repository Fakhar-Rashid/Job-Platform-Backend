import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import { requirePartyContract } from './contracts.service.js';
export async function leaveFeedback(contractId, userId, data) {
    const contract = await requirePartyContract(contractId, userId);
    if (contract.status !== 'ENDED')
        throw new HttpError(409, 'Feedback opens once the contract has ended');
    if (userId === contract.clientId)
        return leaveClientReview(contract, data);
    return leaveFreelancerFeedback(contract, data);
}
async function leaveClientReview(contract, { rating, comment, endorsements }) {
    const existing = await prisma.review.findUnique({ where: { jobId: contract.jobId } });
    if (existing)
        throw new HttpError(409, 'You already reviewed this contract');
    const paid = await prisma.milestone.aggregate({
        where: { contractId: contract.id, status: 'APPROVED' },
        _sum: { amount: true },
    });
    const bid = await prisma.bid.findUniqueOrThrow({ where: { id: contract.bidId } });
    return prisma.review.create({
        data: {
            jobId: contract.jobId,
            authorId: contract.clientId,
            freelancerId: contract.freelancerId,
            rating,
            comment,
            endorsements: endorsements ?? [],
            amount: contract.type === 'FIXED' ? (paid._sum.amount ?? 0) : bid.amount,
            priceType: contract.type,
        },
    });
}
async function leaveFreelancerFeedback(contract, { rating, comment }) {
    const existing = await prisma.clientFeedback.findUnique({ where: { contractId: contract.id } });
    if (existing)
        throw new HttpError(409, 'You already left feedback for this contract');
    return prisma.$transaction(async (tx) => {
        const feedback = await tx.clientFeedback.create({
            data: {
                contractId: contract.id,
                clientId: contract.clientId,
                freelancerId: contract.freelancerId,
                rating,
                comment,
            },
        });
        const stats = await tx.clientFeedback.aggregate({
            where: { clientId: contract.clientId },
            _avg: { rating: true },
        });
        await tx.user.update({
            where: { id: contract.clientId },
            data: { rating: Math.round((stats._avg.rating ?? rating) * 10) / 10 },
        });
        return feedback;
    });
}
//# sourceMappingURL=feedback.service.js.map