import { describe, it, expect } from 'vitest';
import { buildActivityTimeline } from './activity';

const d = (iso: string) => new Date(iso);

describe('buildActivityTimeline', () => {
  it('orders lifecycle events and includes approved milestones as paid', () => {
    const events = buildActivityTimeline({
      acceptedAt: d('2026-03-15T00:00:00Z'),
      endedAt: d('2026-03-18T00:00:00Z'),
      milestones: [
        { status: 'APPROVED', amount: 165, approvedAt: d('2026-03-15T12:00:00Z') },
        { status: 'PENDING', amount: 50, approvedAt: null },
      ],
      hourlyPayouts: [],
      feedbackRating: 5,
      feedbackAt: d('2026-03-18T01:00:00Z'),
    });
    expect(events.map((e) => e.title)).toEqual([
      'Contract started',
      'Milestone completed',
      'Contract ended',
      'Feedback given',
    ]);
    expect(events[1]).toMatchObject({ detail: '$165', badge: 'Paid' });
    expect(events[3].detail).toBe('Total score 5');
  });

  it('includes hourly payouts and omits missing stages', () => {
    const events = buildActivityTimeline({
      acceptedAt: d('2026-03-15T00:00:00Z'),
      endedAt: null,
      milestones: [],
      hourlyPayouts: [{ amount: 90, createdAt: d('2026-03-16T00:00:00Z') }],
      feedbackRating: null,
      feedbackAt: null,
    });
    expect(events.map((e) => e.title)).toEqual(['Contract started', 'Payment released']);
    expect(events[1].detail).toBe('$90');
  });
});
