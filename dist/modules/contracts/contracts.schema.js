import { z } from 'zod';
const positiveInt = z.coerce.number().int().positive();
export const milestoneInputSchema = z.object({
    description: z.string().trim().min(3, 'Milestone description is required'),
    amount: positiveInt,
});
export const hireSchema = z.object({
    bidId: z.string().min(1),
    hourlyRate: positiveInt.optional(),
    milestones: z.array(milestoneInputSchema).max(20).optional(),
    message: z.string().trim().max(5000).optional(),
});
export const submitWorkSchema = z.object({
    message: z.string().trim().min(3, 'Add a short message about the work'),
});
export const requestChangesSchema = z.object({
    note: z.string().trim().min(3, 'Describe the changes you need'),
});
export const logHoursSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    hours: z.coerce.number().positive().max(24, 'A day has at most 24 hours'),
    memo: z.string().trim().min(2, 'A memo is required'),
});
export const feedbackSchema = z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().trim().min(3, 'Please add a short comment'),
    endorsements: z.array(z.string().trim()).max(20).optional().default([]),
});
//# sourceMappingURL=contracts.schema.js.map