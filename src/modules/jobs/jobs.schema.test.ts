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
