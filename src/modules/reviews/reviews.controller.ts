import type { Request, Response } from 'express';
import * as service from './reviews.service.js';

export async function getForJob(req: Request, res: Response) {
  res.json(await service.getForJob(req.params.id));
}
