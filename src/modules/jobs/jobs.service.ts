import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import type { CreateJobInput, UpdateJobInput, ListJobsInput } from './jobs.schema.js';

export const ownerSelect = {
  select: {
    id: true,
    name: true,
    paymentVerified: true,
    phoneVerified: true,
    rating: true,
    totalSpent: true,
    country: true,
    createdAt: true,
  },
};

const CONNECTS_BY_SCOPE: Record<string, number> = { SMALL: 5, MEDIUM: 10, LARGE: 15 };

export function connectsForScope(scopeSize?: string | null): number {
  return CONNECTS_BY_SCOPE[scopeSize ?? ''] ?? 10;
}

export function shape<T extends { _count?: { bids: number } }>(job: T) {
  const { _count, ...rest } = job;
  return { ...rest, bidCount: _count?.bids };
}

export async function listJobs({ search, status, cursor, limit = 20 }: ListJobsInput) {
  const take = Math.min(limit, 50);
  const jobs = await prisma.job.findMany({
    where: {
      status,
      title: search ? { contains: search, mode: 'insensitive' } : undefined,
    },
    include: { owner: ownerSelect, _count: { select: { bids: true } } },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = jobs.length > take;
  const items = (hasMore ? jobs.slice(0, take) : jobs).map(shape);
  return { items, nextCursor: hasMore ? items[items.length - 1].id : null };
}

export async function getJob(id: string) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: { owner: ownerSelect, _count: { select: { bids: true } } },
  });
  if (!job) throw new HttpError(404, 'Job not found');

  const [bidStats, interviewing, openJobs, totalJobs, hiredJobs] = await Promise.all([
    prisma.bid.aggregate({
      where: { jobId: id },
      _max: { amount: true },
      _min: { amount: true },
      _avg: { amount: true },
    }),
    prisma.bid.count({ where: { jobId: id, interviewing: true } }),
    prisma.job.count({ where: { ownerId: job.ownerId, status: 'OPEN' } }),
    prisma.job.count({ where: { ownerId: job.ownerId } }),
    prisma.job.count({ where: { ownerId: job.ownerId, bids: { some: { status: 'ACCEPTED' } } } }),
  ]);

  return {
    ...shape(job),
    activity: {
      proposalCount: job._count.bids,
      interviewing,
      lastViewedAt: job.lastViewedAt,
      bidRange:
        bidStats._max.amount == null
          ? null
          : {
              high: bidStats._max.amount,
              avg: Math.round((bidStats._avg.amount ?? 0) * 100) / 100,
              low: bidStats._min.amount,
            },
    },
    client: {
      paymentVerified: job.owner.paymentVerified,
      phoneVerified: job.owner.phoneVerified,
      country: job.owner.country,
      memberSince: job.owner.createdAt,
      openJobs,
      hireRate: totalJobs === 0 ? 0 : Math.round((hiredJobs / totalJobs) * 100),
    },
  };
}

export async function listMyJobs(ownerId: string) {
  const jobs = await prisma.job.findMany({
    where: { ownerId },
    include: { owner: ownerSelect, _count: { select: { bids: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return jobs.map(shape);
}

export async function createJob(ownerId: string, data: CreateJobInput) {
  const job = await prisma.job.create({
    data: { ...data, ownerId, connectsRequired: connectsForScope(data.scopeSize) },
    include: { owner: ownerSelect, _count: { select: { bids: true } } },
  });
  return shape(job);
}

async function requireOwnedJob(id: string, ownerId: string) {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw new HttpError(404, 'Job not found');
  if (job.ownerId !== ownerId) throw new HttpError(403, 'You do not own this job');
  return job;
}

export async function updateJob(id: string, ownerId: string, data: UpdateJobInput) {
  await requireOwnedJob(id, ownerId);
  const job = await prisma.job.update({
    where: { id },
    data,
    include: { owner: ownerSelect, _count: { select: { bids: true } } },
  });
  return shape(job);
}

export async function deleteJob(id: string, ownerId: string) {
  await requireOwnedJob(id, ownerId);
  await prisma.job.delete({ where: { id } });
}
