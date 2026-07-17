import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Rating is required').max(5),
  comment: z.string().trim().min(3, 'Please add a short comment'),
  endorsements: z.array(z.string().trim()).max(20).optional().default([]),
});
