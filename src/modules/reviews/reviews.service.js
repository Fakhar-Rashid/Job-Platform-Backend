import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';

export async function getForJob(jobId) {
  return prisma.review.findUnique({
    where: { jobId },
    include: { author: { select: { id: true, name: true } } },
  });
}

export async function createReview(jobId, authorId, { rating, comment, endorsements }) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { bids: { where: { status: 'ACCEPTED' } } },
  });
  if (!job) throw new HttpError(404, 'Job not found');
  if (job.ownerId !== authorId) throw new HttpError(403, 'Only the job owner can leave a review');
  if (job.status !== 'CLOSED') throw new HttpError(409, 'You can review once the job is closed');

  const hired = job.bids[0];
  if (!hired) throw new HttpError(409, 'This job has no hired freelancer');

  const existing = await prisma.review.findUnique({ where: { jobId } });
  if (existing) throw new HttpError(409, 'You have already reviewed this job');

  return prisma.review.create({
    data: {
      jobId,
      authorId,
      freelancerId: hired.freelancerId,
      rating,
      comment,
      endorsements: endorsements ?? [],
      amount: hired.amount,
      priceType: job.jobType,
    },
  });
}
