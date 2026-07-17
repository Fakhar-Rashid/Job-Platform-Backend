import { z } from 'zod';

const optionalText = z.string().trim().optional();

const languageSchema = z.object({
  name: z.string().trim().min(1, 'Language is required'),
  proficiency: z.enum(['BASIC', 'CONVERSATIONAL', 'FLUENT', 'NATIVE_OR_BILINGUAL']),
});

const educationSchema = z.object({
  school: z.string().trim().min(1, 'School is required'),
  degree: optionalText,
  fieldOfStudy: optionalText,
  startYear: z.coerce.number().int().optional(),
  endYear: z.coerce.number().int().optional(),
});

const employmentSchema = z.object({
  company: z.string().trim().min(1, 'Company is required'),
  title: z.string().trim().min(1, 'Title is required'),
  startDate: optionalText,
  endDate: optionalText,
  current: z.boolean().optional(),
  description: optionalText,
});

const portfolioSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: optionalText,
  category: optionalText,
  imageUrl: optionalText,
  projectUrl: optionalText,
  published: z.boolean().optional(),
});

const certLikeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  issuer: optionalText,
  year: z.coerce.number().int().optional(),
});

const linkedAccountSchema = z.object({
  provider: z.string().trim().min(1, 'Provider is required'),
  username: z.string().trim().min(1, 'Username is required'),
  url: optionalText,
});

const otherExperienceSchema = z.object({
  subject: z.string().trim().min(1, 'Subject is required'),
  description: optionalText,
});

export const CHILD_RESOURCES = [
  { path: 'languages', model: 'language', schema: languageSchema },
  { path: 'educations', model: 'education', schema: educationSchema },
  { path: 'employments', model: 'employment', schema: employmentSchema },
  { path: 'portfolio', model: 'portfolioItem', schema: portfolioSchema },
  { path: 'certifications', model: 'certification', schema: certLikeSchema },
  { path: 'licenses', model: 'license', schema: certLikeSchema },
  { path: 'linked-accounts', model: 'linkedAccount', schema: linkedAccountSchema },
  { path: 'other-experiences', model: 'otherExperience', schema: otherExperienceSchema },
];
