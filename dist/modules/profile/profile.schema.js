import { z } from 'zod';
const optionalText = z.string().trim().optional();
export const coreSchema = z.object({
    name: z.string().trim().min(2).optional(),
    title: optionalText,
    overview: optionalText,
    hourlyRate: z.coerce.number().int().nonnegative().optional(),
    city: optionalText,
    country: optionalText,
    avatarUrl: optionalText,
    videoIntroUrl: optionalText,
    responseTime: optionalText,
    hoursPerWeek: z.enum(['AS_NEEDED', 'LESS_THAN_30', 'MORE_THAN_30']).optional(),
    openToContractToHire: z.boolean().optional(),
    idVerified: z.boolean().optional(),
    phoneVerified: z.boolean().optional(),
    militaryVeteran: z.boolean().optional(),
    availabilityBadge: z.boolean().optional(),
    boostProfile: z.boolean().optional(),
    showWorkHistory: z.boolean().optional(),
});
export const skillsSchema = z.object({
    skills: z.array(z.string().trim().min(1)).max(50),
});
//# sourceMappingURL=profile.schema.js.map