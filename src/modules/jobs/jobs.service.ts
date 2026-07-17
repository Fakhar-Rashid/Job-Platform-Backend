import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import type { CreateJobInput, UpdateJobInput, ListJobsInput } from './jobs.schema.js';

const ownerSelect = {
  select: { id: true, name: true, paymentVerified: true, rating: true, totalSpent: true, country: true },
};

function shape<T extends { _count?: { bids: number } }>(job: T) {
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
  return shape(job);
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
    data: { ...data, ownerId },
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
