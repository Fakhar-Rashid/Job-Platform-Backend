import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import { BID_CONNECT_COST } from '../../config/env.js';
const freelancerSelect = { select: { id: true, name: true } };
const jobSelect = { select: { id: true, title: true, status: true } };
export async function placeBid(jobId, freelancerId, { amount, coverLetter }) {
    return prisma.$transaction(async (tx) => {
        const job = await tx.job.findUnique({ where: { id: jobId } });
        if (!job)
            throw new HttpError(404, 'Job not found');
        if (job.status !== 'OPEN')
            throw new HttpError(409, 'This job is no longer open');
        if (job.ownerId === freelancerId)
            throw new HttpError(403, 'You cannot bid on your own job');
        const existing = await tx.bid.findUnique({
            where: { jobId_freelancerId: { jobId, freelancerId } },
        });
        if (existing)
            throw new HttpError(409, 'You have already bid on this job');
        const user = await tx.user.findUnique({ where: { id: freelancerId } });
        if (user.connectBalance < BID_CONNECT_COST) {
            throw new HttpError(402, 'Not enough connects to place this bid');
        }
        await tx.user.update({
            where: { id: freelancerId },
            data: { connectBalance: { decrement: BID_CONNECT_COST } },
        });
        await tx.connectTransaction.create({
            data: { userId: freelancerId, amount: -BID_CONNECT_COST, reason: 'BID' },
        });
        return tx.bid.create({
            data: { jobId, freelancerId, amount, coverLetter, connectsSpent: BID_CONNECT_COST },
            include: { freelancer: freelancerSelect },
        });
    });
}
export async function listJobBids(jobId, ownerId) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job)
        throw new HttpError(404, 'Job not found');
    if (job.ownerId !== ownerId)
        throw new HttpError(403, 'Only the job owner can view bids');
    return prisma.bid.findMany({
        where: { jobId },
        include: { freelancer: freelancerSelect },
        orderBy: { createdAt: 'asc' },
    });
}
export async function listMyBids(freelancerId) {
    return prisma.bid.findMany({
        where: { freelancerId },
        include: { job: jobSelect },
        orderBy: { createdAt: 'desc' },
    });
}
export async function acceptBid(bidId, ownerId) {
    return prisma.$transaction(async (tx) => {
        const bid = await tx.bid.findUnique({ where: { id: bidId }, include: { job: true } });
        if (!bid)
            throw new HttpError(404, 'Bid not found');
        if (bid.job.ownerId !== ownerId)
            throw new HttpError(403, 'Only the job owner can accept bids');
        if (bid.job.status !== 'OPEN')
            throw new HttpError(409, 'This job is no longer open');
        await tx.bid.updateMany({
            where: { jobId: bid.jobId, id: { not: bidId } },
            data: { status: 'REJECTED' },
        });
        await tx.job.update({ where: { id: bid.jobId }, data: { status: 'CLOSED' } });
        return tx.bid.update({
            where: { id: bidId },
            data: { status: 'ACCEPTED' },
            include: { freelancer: freelancerSelect },
        });
    });
}
//# sourceMappingURL=bids.service.js.map