import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';

const senderSelect = { select: { id: true, name: true, avatarUrl: true } };

export async function requireParty(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) throw new HttpError(404, 'Conversation not found');
  if (conversation.clientId !== userId && conversation.freelancerId !== userId) {
    throw new HttpError(403, 'You are not part of this conversation');
  }
  return conversation;
}

function readField(conversation: { clientId: string }, userId: string) {
  return conversation.clientId === userId ? 'clientLastReadAt' : 'freelancerLastReadAt';
}

export async function markRead(conversationId: string, userId: string, conversation: { clientId: string }) {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { [readField(conversation, userId)]: new Date() },
  });
}

function shapeMessage(message: {
  id: string;
  type: string;
  body: string;
  createdAt: Date;
  senderId: string;
  sender: { id: string; name: string; avatarUrl: string | null };
  contract: { id: string; type: string; hourlyRate: number | null; milestones: { description: string; amount: number }[] } | null;
}) {
  return {
    id: message.id,
    type: message.type,
    body: message.body,
    createdAt: message.createdAt,
    sender: message.sender,
    offer: message.contract
      ? {
          contractId: message.contract.id,
          type: message.contract.type,
          hourlyRate: message.contract.hourlyRate,
          total: message.contract.milestones.reduce((sum, m) => sum + m.amount, 0),
          firstMilestone: message.contract.milestones[0]?.description ?? null,
        }
      : null,
  };
}

export async function listMessages(conversationId: string, userId: string, search?: string) {
  const conversation = await requireParty(conversationId, userId);
  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      body: search ? { contains: search, mode: 'insensitive' } : undefined,
    },
    include: {
      sender: senderSelect,
      contract: { select: { id: true, type: true, hourlyRate: true, milestones: { orderBy: { order: 'asc' } } } },
    },
    orderBy: { createdAt: 'asc' },
  });
  if (!search) await markRead(conversationId, userId, conversation);
  return messages.map(shapeMessage);
}

export async function sendMessage(conversationId: string, userId: string, body: string) {
  const conversation = await requireParty(conversationId, userId);
  const now = new Date();
  const message = await prisma.message.create({
    data: { conversationId, senderId: userId, body, type: 'TEXT' },
    include: {
      sender: senderSelect,
      contract: { select: { id: true, type: true, hourlyRate: true, milestones: { orderBy: { order: 'asc' } } } },
    },
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: now, [readField(conversation, userId)]: now },
  });
  return shapeMessage(message);
}
