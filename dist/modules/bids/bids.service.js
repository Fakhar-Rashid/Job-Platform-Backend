import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';
const freelancerSelect = { select: { id: true, name: true } };
const jobSelect = { select: { id: true, title: true, status: true } };
export async function placeBid(jobId, freelancerId, { amount, coverLetter, boostConnects }) {
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
        const cost = job.connectsRequired + boostConnects;
        const user = await tx.user.findUnique({ where: { id: freelancerId } });
        if (user.connectBalance < cost) {
            throw new HttpError(402, 'Not enough connects to place this bid');
        }
        await tx.user.update({
            where: { id: freelancerId },
            data: { connectBalance: { decrement: cost } },
        });
        await tx.connectTransaction.create({
            data: { userId: freelancerId, amount: -cost, reason: 'BID' },
        });
        return tx.bid.create({
            data: { jobId, freelancerId, amount, coverLetter, boostConnects, connectsSpent: cost },
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
    await prisma.job.update({ where: { id: jobId }, data: { lastViewedAt: new Date() } });
    return prisma.bid.findMany({
        where: { jobId },
        include: {
            freelancer: freelancerSelect,
            contracts: {
                where: { status: { in: ['OFFERED', 'ACTIVE', 'ENDED'] } },
                select: { id: true, status: true },
                orderBy: { createdAt: 'desc' },
                take: 1,
            },
        },
        orderBy: [{ boostConnects: 'desc' }, { createdAt: 'asc' }],
    });
}
export async function listJobBoosts(jobId) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job)
        throw new HttpError(404, 'Job not found');
    return prisma.bid.findMany({
        where: { jobId, boostConnects: { gt: 0 } },
        select: { boostConnects: true, createdAt: true },
        orderBy: [{ boostConnects: 'desc' }, { createdAt: 'asc' }],
        take: 4,
    });
}
export async function listMyBids(freelancerId) {
    return prisma.bid.findMany({
        where: { freelancerId },
        include: {
            job: jobSelect,
            contracts: {
                where: { status: { in: ['OFFERED', 'ACTIVE', 'ENDED'] } },
                select: { id: true, status: true },
                orderBy: { createdAt: 'desc' },
                take: 1,
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}
//# sourceMappingURL=bids.service.js.map