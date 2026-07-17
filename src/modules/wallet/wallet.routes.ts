import { Router } from 'express';
import type { Request, Response } from 'express';
import * as service from './wallet.service.js';
import { requireAuth } from '../../middleware/auth.js';
import { noStore } from '../../middleware/cache.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const walletRouter = Router();

walletRouter.use(requireAuth, noStore);

walletRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await service.getWallet(req.user!.id));
  }),
);

walletRouter.post(
  '/topup',
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await service.topUp(req.user!.id));
  }),
);
