import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { CLIENTS, FAKHAR, OPEN_JOBS, COMPLETED, PROFILE_CHILDREN } from './seed-data';

const prisma = new PrismaClient();
const SERVICE_FEE_RATE = 0.1;

function payoutAfterFee(amount: number): number {
  return amount - Math.round(amount * SERVICE_FEE_RATE);
}

async function seedProfileChildren(userId: string): Promise<void> {
  await prisma.language.createMany({
    data: PROFILE_CHILDREN.languages.map((language) => ({ ...language, userId })),
  });
  await prisma.education.create({ data: { ...PROFILE_CHILDREN.education, userId } });
  await prisma.employment.create({ data: { ...PROFILE_CHILDREN.employment, userId } });
  await prisma.portfolioItem.createMany({
    data: PROFILE_CHILDREN.portfolio.map((item) => ({ ...item, userId })),
  });
  await prisma.linkedAccount.createMany({
    data: PROFILE_CHILDREN.linkedAccounts.map((account) => ({ ...account, userId })),
  });
  await prisma.otherExperience.create({ data: { ...PROFILE_CHILDREN.otherExperience, userId } });
}

async function seedCompletedJob(
  freelancerId: string,
  clientId: string,
  item: (typeof COMPLETED)[number],
): Promise<void> {
  const job = await prisma.job.create({
    data: {
      ownerId: clientId,
      title: item.title,
      description: item.comment,
      budget: item.amount,
      status: 'CLOSED',
      jobType: 'FIXED',
    },
  });
  const bid = await prisma.bid.create({
    data: {
      jobId: job.id,
      freelancerId,
      amount: item.amount,
      coverLetter: 'Happy to help on this project.',
      connectsSpent: 5,
      status: 'ACCEPTED',
    },
  });
  const contract = await prisma.contract.create({
    data: {
      type: 'FIXED',
      status: 'ENDED',
      acceptedAt: new Date(),
      endedAt: new Date(),
      endedById: clientId,
      jobId: job.id,
      bidId: bid.id,
      clientId,
      freelancerId,
      milestones: {
        create: {
          description: 'Project delivery',
          amount: item.amount,
          order: 0,
          status: 'APPROVED',
          submissionMessage: 'Delivered as discussed.',
          submittedAt: new Date(),
          approvedAt: new Date(),
        },
      },
    },
  });

  const net = payoutAfterFee(item.amount);
  await prisma.user.update({ where: { id: clientId }, data: { walletBalance: { decrement: item.amount } } });
  await prisma.user.update({ where: { id: freelancerId }, data: { walletBalance: { increment: net } } });
  await prisma.walletTransaction.createMany({
    data: [
      { userId: clientId, amount: -item.amount, reason: 'ESCROW_FUND', contractId: contract.id },
      { userId: freelancerId, amount: net, reason: 'MILESTONE_PAYOUT', contractId: contract.id },
    ],
  });

  await prisma.review.create({
    data: {
      jobId: job.id,
      authorId: clientId,
      freelancerId,
      rating: item.rating,
      comment: item.comment,
      endorsements: item.endorsements,
      amount: item.amount,
      priceType: 'FIXED',
    },
  });
  await prisma.clientFeedback.create({
    data: {
      contractId: contract.id,
      clientId,
      freelancerId,
      rating: item.rating,
      comment: item.clientComment,
    },
  });

  const conversation = await prisma.conversation.create({
    data: { jobId: job.id, clientId, freelancerId, contractId: contract.id },
  });
  await prisma.bid.update({ where: { id: bid.id }, data: { interviewing: true } });
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: clientId,
      type: 'OFFER',
      contractId: contract.id,
      body: item.comment,
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: conversation.id, senderId: freelancerId, body: 'Thanks for the offer — accepted! Starting now.' },
      { conversationId: conversation.id, senderId: clientId, body: 'Great, looking forward to it.' },
    ],
  });
}

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', 10);
  const byEmail: Record<string, { id: string }> = {};

  for (const client of CLIENTS) {
    byEmail[client.email] = await prisma.user.upsert({
      where: { email: client.email },
      update: { ...client, passwordHash },
      create: { ...client, passwordHash },
    });
  }

  const fakhar = await prisma.user.upsert({
    where: { email: 'fakhar@example.com' },
    update: { ...FAKHAR },
    create: { email: 'fakhar@example.com', passwordHash, ...FAKHAR },
  });

  if ((await prisma.job.count()) === 0) {
    await seedProfileChildren(fakhar.id);
    for (const { owner, ...job } of OPEN_JOBS) {
      await prisma.job.create({ data: { ...job, ownerId: byEmail[owner].id } });
    }
    for (const item of COMPLETED) {
      await seedCompletedJob(fakhar.id, byEmail[item.owner].id, item);
    }
  }

  console.log('Seeded clients + freelancer fakhar@example.com (password: password123).');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
