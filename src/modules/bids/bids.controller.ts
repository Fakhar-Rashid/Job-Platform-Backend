import type { Request, Response } from 'express';
import * as bidsService from './bids.service.js';

export async function place(req: Request, res: Response) {
  res.status(201).json(await bidsService.placeBid(req.params.id, req.user!.id, req.body));
}

export async function listForJob(req: Request, res: Response) {
  res.json(await bidsService.listJobBids(req.params.id, req.user!.id));
}

export async function mine(req: Request, res: Response) {
  res.json(await bidsService.listMyBids(req.user!.id));
}

export async function accept(req: Request, res: Response) {
  res.json(await bidsService.acceptBid(req.params.id, req.user!.id));
}
