import { Router } from 'express';
import * as controller from './auth.controller.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), asyncHandler(controller.register));
authRouter.post('/login', validate(loginSchema), asyncHandler(controller.login));
authRouter.get('/me', requireAuth, asyncHandler(controller.me));
