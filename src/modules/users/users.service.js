import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import { publicUser } from '../../utils/serialize.js';

export async function getProfile(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { jobs: true, bids: true } } },
  });
  if (!user) throw new HttpError(404, 'User not found');

  return { ...publicUser(user), jobsPosted: user._count.jobs, bidsPlaced: user._count.bids };
}
