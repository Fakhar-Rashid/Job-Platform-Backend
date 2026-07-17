import { Router } from 'express';
import * as controller from './jobs.controller.js';
import { createJobSchema, updateJobSchema, listJobsSchema } from './jobs.schema.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { publicShort } from '../../middleware/cache.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const jobsRouter = Router();

jobsRouter.get('/', publicShort, validate(listJobsSchema, 'query'), asyncHandler(controller.list));
jobsRouter.get('/mine', requireAuth, asyncHandler(controller.mine));
jobsRouter.get('/saved', requireAuth, asyncHandler(controller.listSaved));
jobsRouter.post('/', requireAuth, validate(createJobSchema), asyncHandler(controller.create));
jobsRouter.get('/:id', publicShort, asyncHandler(controller.getOne));
jobsRouter.patch('/:id', requireAuth, validate(updateJobSchema), asyncHandler(controller.update));
jobsRouter.delete('/:id', requireAuth, asyncHandler(controller.remove));
jobsRouter.post('/:id/save', requireAuth, asyncHandler(controller.save));
jobsRouter.delete('/:id/save', requireAuth, asyncHandler(controller.unsave));
