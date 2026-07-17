import { z } from 'zod';

export const createBidSchema = z.object({
  amount: z.coerce.number().int().positive('Bid amount must be a positive number'),
  coverLetter: z.string().trim().min(10, 'Cover letter must be at least 10 characters'),
});
