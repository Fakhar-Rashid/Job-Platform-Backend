import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().trim().min(4, 'Title must be at least 4 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  budget: z.coerce.number().int().positive('Budget must be a positive number'),
});

export const updateJobSchema = z.object({
  title: z.string().trim().min(4).optional(),
  description: z.string().trim().min(10).optional(),
  budget: z.coerce.number().int().positive().optional(),
  status: z.enum(['OPEN', 'CLOSED']).optional(),
});

export const listJobsSchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(['OPEN', 'CLOSED']).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});
