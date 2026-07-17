import { Router } from 'express';
import type { AnyZodObject, ZodTypeAny } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HttpError } from '../../utils/httpError.js';

export function buildChildRouter({ model, schema }: { model: string; schema: ZodTypeAny }) {
  const router = Router();
  const delegate = (prisma as any)[model];

  async function requireOwned(id: string, userId: string) {
    const record = await delegate.findUnique({ where: { id } });
    if (!record) throw new HttpError(404, 'Item not found');
    if (record.userId !== userId) throw new HttpError(403, 'You cannot modify this item');
  }

  router.use(requireAuth);

  router.post(
    '/',
    validate(schema),
    asyncHandler(async (req, res) => {
      const created = await delegate.create({ data: { ...req.body, userId: req.user!.id } });
      res.status(201).json(created);
    }),
  );

  router.patch(
    '/:id',
    validate((schema as AnyZodObject).partial()),
    asyncHandler(async (req, res) => {
      await requireOwned(req.params.id, req.user!.id);
      const updated = await delegate.update({ where: { id: req.params.id }, data: req.body });
      res.json(updated);
    }),
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      await requireOwned(req.params.id, req.user!.id);
      await delegate.delete({ where: { id: req.params.id } });
      res.status(204).end();
    }),
  );

  return router;
}
