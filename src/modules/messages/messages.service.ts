import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import { buildActivityTimeline } from './activity.js';
import { sendMessage, requireParty } from './thread.service.js';
import type { StartConversationInput } from './messages.schema.js';

type Filter = 'all' | 'unread' | 'favorites';

const partySelect = { select: { id: true, name: true, avatarUrl: true, title: true } };

const listInclude = {
  job: { select: { title: true } },
  client: partySelect,
  freelancer: partySelect,
  messages: { orderBy: { createdAt: 'desc' as const }, take: 1 },
};

type ConversationRow = Awaited<ReturnType<typeof loadConversations>>[number];

function loadConversations(userId: string) {
  return prisma.conversation.findMany({
    where: { OR: [{ clientId: userId }, { freelancerId: userId }] },
    include: listInclude,
    orderBy: { lastMessageAt: 'desc' },
  });
}

function view(conversation: ConversationRow, userId: string) {
  const isClient = conversation.clientId === userId;
  const other = isClient ? conversation.freelancer : conversation.client;
  const lastRead = isClient ? conversation.clientLastReadAt : conversation.freelancerLastReadAt;
  const last = conversation.messages[0];
  return {
    id: conversation.id,
    jobId: conversation.jobId,
    jobTitle: conversation.job.title,
    contractId: conversation.contractId,
    role: isClient ? ('client' as const) : ('freelancer' as const),
    otherParty: { id: other.id, name: other.name, avatarUrl: other.avatarUrl, title: other.title },
    favorite: isClient ? conversation.clientFavorite : conversation.freelancerFavorite,
    unread: conversation.lastMessageAt.getTime() > (lastRead?.getTime() ?? 0),
    lastMessageAt: conversation.lastMessageAt,
    lastMessage: last ? { body: last.body, senderId: last.senderId, type: last.type } : null,
  };
}

export async function upsertConversation(clientId: string, freelancerId: string, jobId: string) {
  const conversation = await prisma.conversation.upsert({
    where: { jobId_freelancerId: { jobId, freelancerId } },
    update: {},
    create: { jobId, clientId, freelancerId },
  });
  await prisma.bid.updateMany({ where: { jobId, freelancerId }, data: { interviewing: true } });
  return conversation;
}

export async function startConversation(clientId: string, { jobId, freelancerId, body }: StartConversationInput) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new HttpError(404, 'Job not found');
  if (job.ownerId !== clientId) throw new HttpError(403, 'Only the job owner can start a conversation');

  const bid = await prisma.bid.findUnique({ where: { jobId_freelancerId: { jobId, freelancerId } } });
  if (!bid) throw new HttpError(409, 'You can only message freelancers who applied to this job');

  const conversation = await upsertConversation(clientId, freelancerId, jobId);
  await sendMessage(conversation.id, clientId, body);
  return { id: conversation.id };
}

export async function listConversations(userId: string, filter: Filter = 'all') {
  const rows = await loadConversations(userId);
  let views = rows.map((row) => view(row, userId));
  if (filter === 'unread') views = views.filter((v) => v.unread);
  if (filter === 'favorites') views = views.filter((v) => v.favorite);
  return views;
}

export async function unreadCount(userId: string) {
  const rows = await prisma.conversation.findMany({
    where: { OR: [{ clientId: userId }, { freelancerId: userId }] },
    select: { clientId: true, lastMessageAt: true, clientLastReadAt: true, freelancerLastReadAt: true },
  });
  const count = rows.filter((row) => {
    const lastRead = row.clientId === userId ? row.clientLastReadAt : row.freelancerLastReadAt;
    return row.lastMessageAt.getTime() > (lastRead?.getTime() ?? 0);
  }).length;
  return { count };
}

export async function getConversation(id: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({ where: { id }, include: listInclude });
  if (!conversation) throw new HttpError(404, 'Conversation not found');
  if (conversation.clientId !== userId && conversation.freelancerId !== userId) {
    throw new HttpError(403, 'You are not part of this conversation');
  }

  const base = view(conversation, userId);
  const isClient = conversation.clientId === userId;
  return {
    ...base,
    note: (isClient ? conversation.clientNote : conversation.freelancerNote) ?? '',
    activity: conversation.contractId ? await activityFor(conversation.contractId) : [],
  };
}

async function activityFor(contractId: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { milestones: true, clientFeedback: true, job: { select: { review: true } } },
  });
  if (!contract) return [];
  const payouts = await prisma.walletTransaction.findMany({
    where: { contractId, reason: 'HOURLY_PAYOUT', amount: { gt: 0 } },
    select: { amount: true, createdAt: true },
  });
  const feedback = contract.job.review ?? contract.clientFeedback;
  return buildActivityTimeline({
    acceptedAt: contract.acceptedAt,
    endedAt: contract.endedAt,
    milestones: contract.milestones,
    hourlyPayouts: payouts,
    feedbackRating: feedback?.rating ?? null,
    feedbackAt: feedback?.createdAt ?? null,
  });
}

export async function setNote(id: string, userId: string, note: string) {
  const conversation = await requireParty(id, userId);
  const field = conversation.clientId === userId ? 'clientNote' : 'freelancerNote';
  await prisma.conversation.update({ where: { id }, data: { [field]: note } });
}

export async function toggleFavorite(id: string, userId: string) {
  const conversation = await requireParty(id, userId);
  const isClient = conversation.clientId === userId;
  const current = isClient ? conversation.clientFavorite : conversation.freelancerFavorite;
  await prisma.conversation.update({
    where: { id },
    data: { [isClient ? 'clientFavorite' : 'freelancerFavorite']: !current },
  });
}
