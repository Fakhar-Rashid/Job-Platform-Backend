export interface ActivityEvent {
  title: string;
  detail?: string;
  badge?: string;
  at: string;
}

export interface ActivityInput {
  acceptedAt: Date | null;
  endedAt: Date | null;
  milestones: { status: string; amount: number; approvedAt: Date | null }[];
  hourlyPayouts: { amount: number; createdAt: Date }[];
  feedbackRating: number | null;
  feedbackAt: Date | null;
}

export function buildActivityTimeline(input: ActivityInput): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  if (input.acceptedAt) {
    events.push({ title: 'Contract started', at: input.acceptedAt.toISOString() });
  }
  for (const milestone of input.milestones) {
    if (milestone.status === 'APPROVED' && milestone.approvedAt) {
      events.push({
        title: 'Milestone completed',
        detail: `$${milestone.amount}`,
        badge: 'Paid',
        at: milestone.approvedAt.toISOString(),
      });
    }
  }
  for (const payout of input.hourlyPayouts) {
    events.push({
      title: 'Payment released',
      detail: `$${payout.amount}`,
      badge: 'Paid',
      at: payout.createdAt.toISOString(),
    });
  }
  if (input.endedAt) {
    events.push({ title: 'Contract ended', at: input.endedAt.toISOString() });
  }
  if (input.feedbackRating != null) {
    events.push({
      title: 'Feedback given',
      detail: `Total score ${input.feedbackRating}`,
      at: (input.feedbackAt ?? input.endedAt ?? new Date(0)).toISOString(),
    });
  }

  return events.sort((a, b) => a.at.localeCompare(b.at));
}
