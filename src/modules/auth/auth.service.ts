import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { signToken } from '../../lib/token.js';
import { HttpError } from '../../utils/httpError.js';
import { currentUser } from '../../utils/serialize.js';
import { STARTING_CONNECTS } from '../../config/env.js';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export async function register({ name, email, password }: RegisterData) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, 'Email is already registered');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, connectBalance: STARTING_CONNECTS },
  });

  return { token: signToken({ sub: user.id }), user: currentUser(user) };
}

export async function login({ email, password }: LoginData) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, 'Invalid email or password');
  }

  return { token: signToken({ sub: user.id }), user: currentUser(user) };
}

export async function getCurrent(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(404, 'User not found');
  return currentUser(user);
}
