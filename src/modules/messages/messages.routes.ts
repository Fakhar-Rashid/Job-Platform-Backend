import { Router } from 'express';
import * as controller from './messages.controller.js';
import {
  startConversationSchema,
  sendMessageSchema,
  noteSchema,
  listConversationsSchema,
  listMessagesSchema,
} from './messages.schema.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { noStore } from '../../middleware/cache.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const conversationsRouter = Router();

conversationsRouter.use(requireAuth, noStore);

conversationsRouter.post('/', validate(startConversationSchema), asyncHandler(controller.start));
conversationsRouter.get('/', validate(listConversationsSchema, 'query'), asyncHandler(controller.list));
conversationsRouter.get('/unread-count', asyncHandler(controller.unread));
conversationsRouter.get('/:id', asyncHandler(controller.get));
conversationsRouter.get('/:id/messages', validate(listMessagesSchema, 'query'), asyncHandler(controller.messages));
conversationsRouter.post('/:id/messages', validate(sendMessageSchema), asyncHandler(controller.send));
conversationsRouter.patch('/:id/note', validate(noteSchema), asyncHandler(controller.note));
conversationsRouter.post('/:id/favorite', asyncHandler(controller.favorite));
