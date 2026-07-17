import { SERVICE_FEE_RATE } from '../config/env.js';

export function payoutAfterFee(amount: number): number {
  return amount - Math.round(amount * SERVICE_FEE_RATE);
}

export function hoursTotal(entries: { hours: number }[], hourlyRate: number): number {
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  return Math.round(totalHours * hourlyRate);
}
