import type { Request, Response } from 'express';
import * as service from './reviews.service.js';

export async function getForJob(req: Request, res: Response) {
  res.json(await service.getForJob(req.params.id));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await service.createReview(req.params.id, req.user!.id, req.body));
}
