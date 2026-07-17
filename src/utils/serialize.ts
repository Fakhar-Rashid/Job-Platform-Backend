import type { User } from '@prisma/client';

export function publicUser(user: User | null) {
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

export function currentUser(user: User) {
  return {
    ...publicUser(user),
    connectBalance: user.connectBalance,
    walletBalance: user.walletBalance,
    title: user.title,
    avatarUrl: user.avatarUrl,
    hourlyRate: user.hourlyRate,
    activeRole: user.activeRole,
    onlineForMessages: user.onlineForMessages,
  };
}
