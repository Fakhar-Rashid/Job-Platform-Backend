import { Router } from 'express';
import * as controller from './jobs.controller.js';
import { createJobSchema, updateJobSchema, listJobsSchema } from './jobs.schema.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const jobsRouter = Router();

jobsRouter.get('/', validate(listJobsSchema, 'query'), asyncHandler(controller.list));
jobsRouter.get('/mine', requireAuth, asyncHandler(controller.mine));
jobsRouter.post('/', requireAuth, validate(createJobSchema), asyncHandler(controller.create));
jobsRouter.get('/:id', asyncHandler(controller.getOne));
jobsRouter.patch('/:id', requireAuth, validate(updateJobSchema), asyncHandler(controller.update));
jobsRouter.delete('/:id', requireAuth, asyncHandler(controller.remove));
