import { Router } from 'express';
import * as controller from './bids.controller.js';
import { createBidSchema } from './bids.schema.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const jobBidsRouter = Router({ mergeParams: true });
jobBidsRouter.post('/', requireAuth, validate(createBidSchema), asyncHandler(controller.place));
jobBidsRouter.get('/', requireAuth, asyncHandler(controller.listForJob));
jobBidsRouter.get('/boosts', requireAuth, asyncHandler(controller.boosts));

export const bidsRouter = Router();
bidsRouter.get('/mine', requireAuth, asyncHandler(controller.mine));
