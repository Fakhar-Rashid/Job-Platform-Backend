import { describe, it, expect } from 'vitest';
import { payoutAfterFee, hoursTotal } from './money';

describe('payoutAfterFee', () => {
  it('takes a 10% fee', () => {
    expect(payoutAfterFee(100)).toBe(90);
  });

  it('rounds the fee on odd amounts', () => {
    expect(payoutAfterFee(35)).toBe(31);
    expect(payoutAfterFee(165)).toBe(148);
  });

  it('handles zero', () => {
    expect(payoutAfterFee(0)).toBe(0);
  });
});

describe('hoursTotal', () => {
  it('sums hours times rate, rounded', () => {
    expect(hoursTotal([{ hours: 2 }, { hours: 1.5 }], 15)).toBe(53);
  });

  it('returns zero for no entries', () => {
    expect(hoursTotal([], 15)).toBe(0);
  });
});
