import { Router } from 'express';
import * as controller from './connects.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { noStore } from '../../middleware/cache.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const connectsRouter = Router();

connectsRouter.use(requireAuth, noStore);
connectsRouter.get('/balance', asyncHandler(controller.balance));
connectsRouter.post('/topup', asyncHandler(controller.topUp));
connectsRouter.get('/transactions', asyncHandler(controller.transactions));
