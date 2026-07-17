import { z } from 'zod';
const positiveInt = z.coerce.number().int().positive();
export const createJobSchema = z
    .object({
    title: z.string().trim().min(4, 'Title must be at least 4 characters'),
    description: z.string().trim().min(10, 'Description must be at least 10 characters').max(50_000),
    jobType: z.enum(['FIXED', 'HOURLY']).default('FIXED'),
    budget: positiveInt.optional(),
    hourlyRateMin: positiveInt.optional(),
    hourlyRateMax: positiveInt.optional(),
    category: z.string().trim().min(1).optional(),
    projectTerm: z.enum(['LONG_TERM', 'SHORT_TERM']).optional(),
    scopeSize: z.enum(['LARGE', 'MEDIUM', 'SMALL']).optional(),
    duration: z.enum(['MORE_THAN_6_MONTHS', 'THREE_TO_SIX_MONTHS', 'ONE_TO_THREE_MONTHS']).optional(),
    experienceLevel: z.enum(['ENTRY', 'INTERMEDIATE', 'EXPERT']).default('ENTRY'),
    contractToHire: z.boolean().default(false),
    skills: z.array(z.string().trim().min(1)).max(10).default([]),
})
    .superRefine((data, ctx) => {
    if (data.jobType === 'FIXED' && !data.budget) {
        ctx.addIssue({ code: 'custom', message: 'A budget is required for fixed price jobs', path: ['budget'] });
    }
    if (data.jobType === 'HOURLY') {
        if (!data.hourlyRateMin || !data.hourlyRateMax) {
            ctx.addIssue({ code: 'custom', message: 'An hourly rate range is required', path: ['hourlyRateMin'] });
        }
        else if (data.hourlyRateMin > data.hourlyRateMax) {
            ctx.addIssue({ code: 'custom', message: 'Minimum rate cannot exceed maximum rate', path: ['hourlyRateMin'] });
        }
    }
});
export const updateJobSchema = z.object({
    title: z.string().trim().min(4).optional(),
    description: z.string().trim().min(10).optional(),
    budget: positiveInt.optional(),
    status: z.enum(['OPEN', 'CLOSED']).optional(),
});
export const listJobsSchema = z.object({
    search: z.string().trim().optional(),
    status: z.enum(['OPEN', 'CLOSED']).optional(),
    cursor: z.string().optional(),
    limit: z.coerce.number().int().positive().max(50).optional(),
});
//# sourceMappingURL=jobs.schema.js.map