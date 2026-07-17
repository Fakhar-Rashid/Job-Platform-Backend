import { Router } from 'express';
import * as controller from './profile.controller.js';
import { coreSchema, skillsSchema } from './profile.schema.js';
import { CHILD_RESOURCES } from './profile.children.js';
import { buildChildRouter } from './childResource.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { publicShort } from '../../middleware/cache.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
export const profileRouter = Router();
profileRouter.patch('/', requireAuth, validate(coreSchema), asyncHandler(controller.updateCore));
profileRouter.put('/skills', requireAuth, validate(skillsSchema), asyncHandler(controller.updateSkills));
for (const { path, model, schema } of CHILD_RESOURCES) {
    profileRouter.use(`/${path}`, buildChildRouter({ model, schema }));
}
profileRouter.get('/:id', publicShort, asyncHandler(controller.get));
//# sourceMappingURL=profile.routes.js.map