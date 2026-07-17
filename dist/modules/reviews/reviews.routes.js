import { Router } from 'express';
import * as controller from './reviews.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
export const jobReviewRouter = Router({ mergeParams: true });
jobReviewRouter.get('/', asyncHandler(controller.getForJob));
//# sourceMappingURL=reviews.routes.js.map