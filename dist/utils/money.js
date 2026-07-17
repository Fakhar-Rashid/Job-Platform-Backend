import { SERVICE_FEE_RATE } from '../config/env.js';
export function payoutAfterFee(amount) {
    return amount - Math.round(amount * SERVICE_FEE_RATE);
}
export function hoursTotal(entries, hourlyRate) {
    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
    return Math.round(totalHours * hourlyRate);
}
//# sourceMappingURL=money.js.map