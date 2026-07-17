import { describe, it, expect } from 'vitest';
import { createJobSchema, listJobsSchema } from './jobs.schema';

describe('createJobSchema', () => {
  it('coerces a numeric-string budget to a number', () => {
    const result = createJobSchema.parse({
      title: 'Build a landing page',
      description: 'A responsive marketing site.',
      budget: '500',
    });
    expect(result.budget).toBe(500);
  });

  it('rejects a title that is too short', () => {
    const result = createJobSchema.safeParse({ title: 'a', description: 'long enough text', budget: 100 });
    expect(result.success).toBe(false);
  });

  it('rejects a non-positive budget', () => {
    const result = createJobSchema.safeParse({
      title: 'Valid title',
      description: 'long enough text',
      budget: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a fixed price job without a budget', () => {
    const result = createJobSchema.safeParse({
      title: 'Valid title',
      description: 'long enough text',
      jobType: 'FIXED',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an hourly job without a rate range', () => {
    const result = createJobSchema.safeParse({
      title: 'Valid title',
      description: 'long enough text',
      jobType: 'HOURLY',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an hourly range where min exceeds max', () => {
    const result = createJobSchema.safeParse({
      title: 'Valid title',
      description: 'long enough text',
      jobType: 'HOURLY',
      hourlyRateMin: 30,
      hourlyRateMax: 13,
    });
    expect(result.success).toBe(false);
  });

  it('accepts a full hourly job with wizard fields', () => {
    const result = createJobSchema.parse({
      title: 'Expert developer',
      description: 'long enough description text',
      jobType: 'HOURLY',
      hourlyRateMin: '13',
      hourlyRateMax: '30',
      category: 'Full Stack Development',
      projectTerm: 'SHORT_TERM',
      scopeSize: 'MEDIUM',
      duration: 'ONE_TO_THREE_MONTHS',
      experienceLevel: 'ENTRY',
      contractToHire: false,
      skills: ['API', 'HTML', 'JavaScript'],
    });
    expect(result.hourlyRateMin).toBe(13);
    expect(result.skills).toHaveLength(3);
  });
});

describe('listJobsSchema', () => {
  it('caps limit at 50 by rejecting larger values', () => {
    expect(listJobsSchema.safeParse({ limit: '80' }).success).toBe(false);
    expect(listJobsSchema.parse({ limit: '20' }).limit).toBe(20);
  });

  it('accepts an empty query', () => {
    expect(listJobsSchema.safeParse({}).success).toBe(true);
  });
});
