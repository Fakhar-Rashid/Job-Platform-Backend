import type { Request, Response } from 'express';
import * as usersService from './users.service.js';

export async function getProfile(req: Request, res: Response) {
  const user = await usersService.getProfile(req.params.id);
  res.json(user);
}

export async function listTalent(_req: Request, res: Response) {
  res.json(await usersService.listTalent());
}
