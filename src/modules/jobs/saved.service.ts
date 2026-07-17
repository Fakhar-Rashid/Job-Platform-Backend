import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import { ownerSelect, shape } from './jobs.service.js';

export async function listSaved(userId: string) {
  const saved = await prisma.savedJob.findMany({
    where: { userId },
    include: { job: { include: { owner: ownerSelect, _count: { select: { bids: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  return saved.map((entry) => shape(entry.job));
}

export async function saveJob(userId: string, jobId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new HttpError(404, 'Job not found');

  await prisma.savedJob.upsert({
    where: { userId_jobId: { userId, jobId } },
    update: {},
    create: { userId, jobId },
  });
}

export async function unsaveJob(userId: string, jobId: string) {
  await prisma.savedJob.deleteMany({ where: { userId, jobId } });
}
