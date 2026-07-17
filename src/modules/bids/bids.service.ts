import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import type { CreateBidInput } from './bids.schema.js';

const freelancerSelect = { select: { id: true, name: true } };
const jobSelect = { select: { id: true, title: true, status: true } };

export async function placeBid(
  jobId: string,
  freelancerId: string,
  { amount, coverLetter, boostConnects }: CreateBidInput,
) {
  return prisma.$transaction(async (tx) => {
    const job = await tx.job.findUnique({ where: { id: jobId } });
    if (!job) throw new HttpError(404, 'Job not found');
    if (job.status !== 'OPEN') throw new HttpError(409, 'This job is no longer open');
    if (job.ownerId === freelancerId) throw new HttpError(403, 'You cannot bid on your own job');

    const existing = await tx.bid.findUnique({
      where: { jobId_freelancerId: { jobId, freelancerId } },
    });
    if (existing) throw new HttpError(409, 'You have already bid on this job');

    const cost = job.connectsRequired + boostConnects;
    const user = await tx.user.findUnique({ where: { id: freelancerId } });
    if (user!.connectBalance < cost) {
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

export async function listJobBids(jobId: string, ownerId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new HttpError(404, 'Job not found');
  if (job.ownerId !== ownerId) throw new HttpError(403, 'Only the job owner can view bids');

  await prisma.job.update({ where: { id: jobId }, data: { lastViewedAt: new Date() } });

  return prisma.bid.findMany({
    where: { jobId },
    include: { freelancer: freelancerSelect },
    orderBy: [{ boostConnects: 'desc' }, { createdAt: 'asc' }],
  });
}

export async function listJobBoosts(jobId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new HttpError(404, 'Job not found');

  return prisma.bid.findMany({
    where: { jobId, boostConnects: { gt: 0 } },
    select: { boostConnects: true, createdAt: true },
    orderBy: [{ boostConnects: 'desc' }, { createdAt: 'asc' }],
    take: 4,
  });
}

export async function listMyBids(freelancerId: string) {
  return prisma.bid.findMany({
    where: { freelancerId },
    include: { job: jobSelect },
    orderBy: { createdAt: 'desc' },
  });
}

export async function acceptBid(bidId: string, ownerId: string) {
  return prisma.$transaction(async (tx) => {
    const bid = await tx.bid.findUnique({ where: { id: bidId }, include: { job: true } });
    if (!bid) throw new HttpError(404, 'Bid not found');
    if (bid.job.ownerId !== ownerId) throw new HttpError(403, 'Only the job owner can accept bids');
    if (bid.job.status !== 'OPEN') throw new HttpError(409, 'This job is no longer open');

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
