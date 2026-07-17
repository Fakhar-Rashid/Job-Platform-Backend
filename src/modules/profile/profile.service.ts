import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import type { CoreInput } from './profile.schema.js';

const childRelations = {
  languages: true,
  educations: true,
  employments: true,
  portfolioItems: true,
  certifications: true,
  licenses: true,
  linkedAccounts: true,
  otherExperiences: true,
  reviewsReceived: {
    include: { author: { select: { id: true, name: true } }, job: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'desc' },
  },
} as const;

function sanitize<T extends { passwordHash: unknown; email: unknown }>(user: T) {
  const { passwordHash: _passwordHash, email: _email, ...rest } = user;
  return rest;
}

function aggregateEndorsements(reviews: { endorsements: string[] }[]) {
  const counts: Record<string, number> = {};
  for (const review of reviews) {
    for (const label of review.endorsements) counts[label] = (counts[label] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getFullProfile(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, include: childRelations });
  if (!user) throw new HttpError(404, 'User not found');

  const [endedContracts, earnings] = await Promise.all([
    prisma.contract.findMany({
      where: { freelancerId: id, status: 'ENDED' },
      include: {
        job: { select: { id: true, title: true } },
        milestones: { where: { status: 'APPROVED' }, select: { amount: true } },
        bid: { select: { amount: true } },
      },
      orderBy: { endedAt: 'desc' },
    }),
    prisma.walletTransaction.aggregate({
      where: { userId: id, reason: { in: ['MILESTONE_PAYOUT', 'HOURLY_PAYOUT'] }, amount: { gt: 0 } },
      _sum: { amount: true },
    }),
  ]);

  const reviews = user.reviewsReceived;
  const reviewByJob = Object.fromEntries(reviews.map((r) => [r.jobId, r]));
  const completedJobs = endedContracts.map((contract) => ({
    id: contract.job.id,
    title: contract.job.title,
    jobType: contract.type,
    amount:
      contract.type === 'FIXED'
        ? contract.milestones.reduce((sum, m) => sum + m.amount, 0)
        : contract.bid.amount,
    review: reviewByJob[contract.jobId] ?? null,
  }));

  return {
    ...sanitize(user),
    stats: {
      totalEarnings: earnings._sum.amount ?? 0,
      totalJobs: endedContracts.length,
      reviewCount: reviews.length,
      rating: reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null,
    },
    insights: aggregateEndorsements(reviews),
    completedJobs,
  };
}

export async function updateCore(userId: string, data: CoreInput) {
  const user = await prisma.user.update({ where: { id: userId }, data });
  return sanitize(user);
}

export async function updateSkills(userId: string, skills: string[]) {
  const user = await prisma.user.update({ where: { id: userId }, data: { skills } });
  return { skills: user.skills };
}
