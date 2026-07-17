import { Router } from 'express';
import * as controller from './auth.controller.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimit.js';
import { noStore } from '../../middleware/cache.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
export const authRouter = Router();
authRouter.post('/register', authLimiter, validate(registerSchema), asyncHandler(controller.register));
authRouter.post('/login', authLimiter, validate(loginSchema), asyncHandler(controller.login));
authRouter.get('/me', requireAuth, noStore, asyncHandler(controller.me));
//# sourceMappingURL=auth.routes.js.map