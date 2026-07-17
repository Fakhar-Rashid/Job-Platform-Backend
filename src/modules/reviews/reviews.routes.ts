import { Router } from 'express';
import * as controller from './reviews.controller.js';
import { reviewSchema } from './reviews.schema.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const jobReviewRouter = Router({ mergeParams: true });

jobReviewRouter.get('/', asyncHandler(controller.getForJob));
jobReviewRouter.post('/', requireAuth, validate(reviewSchema), asyncHandler(controller.create));
