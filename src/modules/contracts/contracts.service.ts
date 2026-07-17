import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import { upsertConversation } from '../messages/messages.service.js';
import type { HireInput } from './contracts.schema.js';

const partySelect = { select: { id: true, name: true, avatarUrl: true } };

const listInclude = {
  job: { select: { id: true, title: true } },
  client: partySelect,
  freelancer: partySelect,
  milestones: { select: { amount: true, status: true } },
};

export async function requirePartyContract(contractId: string, userId: string) {
  const contract = await prisma.contract.findUnique({ where: { id: contractId } });
  if (!contract) throw new HttpError(404, 'Contract not found');
  if (contract.clientId !== userId && contract.freelancerId !== userId) {
    throw new HttpError(403, 'You are not part of this contract');
  }
  return contract;
}

export async function hire(clientId: string, { bidId, hourlyRate, milestones, message }: HireInput) {
  const bid = await prisma.bid.findUnique({ where: { id: bidId }, include: { job: true } });
  if (!bid) throw new HttpError(404, 'Proposal not found');
  if (bid.job.ownerId !== clientId) throw new HttpError(403, 'Only the job owner can hire');
  if (bid.job.status !== 'OPEN') throw new HttpError(409, 'This job is no longer open');

  const existing = await prisma.contract.findFirst({
    where: { bidId, status: { in: ['OFFERED', 'ACTIVE'] } },
  });
  if (existing) throw new HttpError(409, 'An offer or contract already exists for this proposal');

  const type = bid.job.jobType;
  if (type === 'FIXED' && (!milestones || milestones.length === 0)) {
    throw new HttpError(400, 'Fixed price offers need at least one milestone');
  }

  const contract = await prisma.contract.create({
    data: {
      type,
      hourlyRate: type === 'HOURLY' ? (hourlyRate ?? bid.amount) : null,
      offerMessage: message,
      jobId: bid.jobId,
      bidId,
      clientId,
      freelancerId: bid.freelancerId,
      milestones:
        type === 'FIXED'
          ? { create: milestones!.map((m, index) => ({ ...m, order: index })) }
          : undefined,
    },
    include: listInclude,
  });

  const conversation = await upsertConversation(clientId, bid.freelancerId, bid.jobId);
  await prisma.conversation.update({ where: { id: conversation.id }, data: { contractId: contract.id } });
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: clientId,
      type: 'OFFER',
      contractId: contract.id,
      body: message ?? `Sent an offer for "${bid.job.title}".`,
    },
  });
  await prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date() } });

  return contract;
}

export async function accept(contractId: string, freelancerId: string) {
  return prisma.$transaction(async (tx) => {
    const contract = await tx.contract.findUnique({ where: { id: contractId } });
    if (!contract) throw new HttpError(404, 'Contract not found');
    if (contract.freelancerId !== freelancerId) throw new HttpError(403, 'This offer is not yours');
    if (contract.status !== 'OFFERED') throw new HttpError(409, 'This offer is no longer pending');

    await tx.contract.update({
      where: { id: contractId },
      data: { status: 'ACTIVE', acceptedAt: new Date() },
    });
    await tx.job.update({ where: { id: contract.jobId }, data: { status: 'CLOSED' } });
    await tx.bid.update({ where: { id: contract.bidId }, data: { status: 'ACCEPTED' } });
    await tx.bid.updateMany({
      where: { jobId: contract.jobId, id: { not: contract.bidId } },
      data: { status: 'REJECTED' },
    });
    await tx.contract.updateMany({
      where: { jobId: contract.jobId, id: { not: contractId }, status: 'OFFERED' },
      data: { status: 'WITHDRAWN' },
    });

    return tx.contract.findUniqueOrThrow({ where: { id: contractId }, include: listInclude });
  });
}

export async function decline(contractId: string, freelancerId: string) {
  const contract = await requirePartyContract(contractId, freelancerId);
  if (contract.freelancerId !== freelancerId) throw new HttpError(403, 'This offer is not yours');
  if (contract.status !== 'OFFERED') throw new HttpError(409, 'This offer is no longer pending');
  return prisma.contract.update({ where: { id: contractId }, data: { status: 'DECLINED' } });
}

export async function withdraw(contractId: string, clientId: string) {
  const contract = await requirePartyContract(contractId, clientId);
  if (contract.clientId !== clientId) throw new HttpError(403, 'Only the client can withdraw an offer');
  if (contract.status !== 'OFFERED') throw new HttpError(409, 'This offer is no longer pending');
  return prisma.contract.update({ where: { id: contractId }, data: { status: 'WITHDRAWN' } });
}

export async function end(contractId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const contract = await tx.contract.findUnique({
      where: { id: contractId },
      include: { milestones: true },
    });
    if (!contract) throw new HttpError(404, 'Contract not found');
    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      throw new HttpError(403, 'You are not part of this contract');
    }
    if (contract.status !== 'ACTIVE') throw new HttpError(409, 'Only active contracts can be ended');

    const refundable = contract.milestones.filter((m) =>
      ['FUNDED', 'SUBMITTED', 'CHANGES_REQUESTED'].includes(m.status),
    );
    const refund = refundable.reduce((sum, m) => sum + m.amount, 0);
    if (refund > 0) {
      await tx.user.update({
        where: { id: contract.clientId },
        data: { walletBalance: { increment: refund } },
      });
      await tx.walletTransaction.create({
        data: { userId: contract.clientId, amount: refund, reason: 'ESCROW_REFUND', contractId },
      });
    }
    await tx.milestone.updateMany({
      where: { contractId, status: { in: ['PENDING', 'FUNDED', 'SUBMITTED', 'CHANGES_REQUESTED'] } },
      data: { status: 'CANCELLED' },
    });

    return tx.contract.update({
      where: { id: contractId },
      data: { status: 'ENDED', endedAt: new Date(), endedById: userId },
      include: listInclude,
    });
  });
}

export async function listMine(userId: string) {
  return prisma.contract.findMany({
    where: { OR: [{ clientId: userId }, { freelancerId: userId }] },
    include: listInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function get(contractId: string, userId: string) {
  await requirePartyContract(contractId, userId);
  const contract = await prisma.contract.findUniqueOrThrow({
    where: { id: contractId },
    include: {
      job: { select: { id: true, title: true } },
      client: partySelect,
      freelancer: partySelect,
      milestones: { orderBy: { order: 'asc' } },
      timeEntries: { orderBy: [{ date: 'desc' }, { createdAt: 'desc' }] },
      clientFeedback: true,
    },
  });

  const review = await prisma.review.findUnique({
    where: { jobId: contract.jobId },
    include: { author: { select: { id: true, name: true } } },
  });
  const escrow = {
    funded: contract.milestones
      .filter((m) => ['FUNDED', 'SUBMITTED', 'CHANGES_REQUESTED'].includes(m.status))
      .reduce((sum, m) => sum + m.amount, 0),
    released: contract.milestones
      .filter((m) => m.status === 'APPROVED')
      .reduce((sum, m) => sum + m.amount, 0),
  };

  return { ...contract, review, escrow };
}
