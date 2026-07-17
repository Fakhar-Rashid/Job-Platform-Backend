import { prisma } from '../../lib/prisma.js';
export async function getForJob(jobId) {
    return prisma.review.findUnique({
        where: { jobId },
        include: { author: { select: { id: true, name: true } } },
    });
}
//# sourceMappingURL=reviews.service.js.map