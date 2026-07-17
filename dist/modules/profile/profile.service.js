import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/httpError.js';
const childRelations = {
    languages: true,
    educations: true,
    employments: true,
    portfolioItems: true,
    certifications: true,
    licenses: true,
    linkedAccounts: true,
    otherExperiences: true,
    reviewsReceived: {
        include: { author: { select: { id: true, name: true } }, job: { select: { id: true, title: true } } },
        orderBy: { createdAt: 'desc' },
    },
};
function sanitize(user) {
    const { passwordHash, email, ...rest } = user;
    return rest;
}
function aggregateEndorsements(reviews) {
    const counts = {};
    for (const review of reviews) {
        for (const label of review.endorsements)
            counts[label] = (counts[label] ?? 0) + 1;
    }
    return Object.entries(counts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);
}
export async function getFullProfile(id) {
    const user = await prisma.user.findUnique({ where: { id }, include: childRelations });
    if (!user)
        throw new HttpError(404, 'User not found');
    const acceptedBids = await prisma.bid.findMany({
        where: { freelancerId: id, status: 'ACCEPTED' },
        include: { job: { select: { id: true, title: true, jobType: true, createdAt: true } } },
        orderBy: { createdAt: 'desc' },
    });
    const reviews = user.reviewsReceived;
    const reviewByJob = Object.fromEntries(reviews.map((r) => [r.jobId, r]));
    const completedJobs = acceptedBids.map((bid) => ({
        id: bid.job.id,
        title: bid.job.title,
        jobType: bid.job.jobType,
        amount: bid.amount,
        review: reviewByJob[bid.jobId] ?? null,
    }));
    return {
        ...sanitize(user),
        stats: {
            totalEarnings: acceptedBids.reduce((sum, bid) => sum + bid.amount, 0),
            totalJobs: acceptedBids.length,
            reviewCount: reviews.length,
            rating: reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null,
        },
        insights: aggregateEndorsements(reviews),
        completedJobs,
    };
}
export async function updateCore(userId, data) {
    const user = await prisma.user.update({ where: { id: userId }, data });
    return sanitize(user);
}
export async function updateSkills(userId, skills) {
    const user = await prisma.user.update({ where: { id: userId }, data: { skills } });
    return { skills: user.skills };
}
//# sourceMappingURL=profile.service.js.map