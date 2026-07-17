import type { Request, Response } from 'express';
import * as service from './profile.service.js';

export async function get(req: Request, res: Response) {
  res.json(await service.getFullProfile(req.params.id));
}

export async function updateCore(req: Request, res: Response) {
  res.json(await service.updateCore(req.user!.id, req.body));
}

export async function updateSkills(req: Request, res: Response) {
  res.json(await service.updateSkills(req.user!.id, req.body.skills));
}
