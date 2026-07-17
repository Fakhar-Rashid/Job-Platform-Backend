import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env, isProduction } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { jobsRouter } from './modules/jobs/jobs.routes.js';
import { jobBidsRouter, bidsRouter } from './modules/bids/bids.routes.js';
import { connectsRouter } from './modules/connects/connects.routes.js';
import { profileRouter } from './modules/profile/profile.routes.js';
import { jobReviewRouter } from './modules/reviews/reviews.routes.js';
import { contractsRouter, milestonesRouter, hoursRouter } from './modules/contracts/contracts.routes.js';
import { walletRouter } from './modules/wallet/wallet.routes.js';
import { conversationsRouter } from './modules/messages/messages.routes.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/error.js';
export function createApp() {
    const app = express();
    if (isProduction)
        app.set('trust proxy', 1);
    app.use(helmet());
    app.use(cors({ origin: env.clientOrigin }));
    app.use(express.json({ limit: '100kb' }));
    app.use(morgan(isProduction ? 'combined' : 'dev'));
    app.use('/api', apiLimiter);
    app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
    app.use('/api/auth', authRouter);
    app.use('/api/users', usersRouter);
    app.use('/api/jobs', jobsRouter);
    app.use('/api/jobs/:id/bids', jobBidsRouter);
    app.use('/api/jobs/:id/review', jobReviewRouter);
    app.use('/api/bids', bidsRouter);
    app.use('/api/connects', connectsRouter);
    app.use('/api/profile', profileRouter);
    app.use('/api/contracts', contractsRouter);
    app.use('/api/milestones', milestonesRouter);
    app.use('/api/hours', hoursRouter);
    app.use('/api/wallet', walletRouter);
    app.use('/api/conversations', conversationsRouter);
    app.use(notFound);
    app.use(errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map