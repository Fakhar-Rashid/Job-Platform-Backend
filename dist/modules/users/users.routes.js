import { Router } from 'express';
import * as controller from './users.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
export const usersRouter = Router();
usersRouter.get('/', asyncHandler(controller.listTalent));
usersRouter.get('/:id', asyncHandler(controller.getProfile));
//# sourceMappingURL=users.routes.js.map