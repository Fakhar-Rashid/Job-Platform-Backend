import type { Request, Response } from 'express';
import * as connectsService from './connects.service.js';

export async function balance(req: Request, res: Response) {
  res.json(await connectsService.getBalance(req.user!.id));
}

export async function topUp(req: Request, res: Response) {
  res.json(await connectsService.topUp(req.user!.id));
}

export async function transactions(req: Request, res: Response) {
  res.json(await connectsService.listTransactions(req.user!.id));
}
