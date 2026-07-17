import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { jobsRouter } from './modules/jobs/jobs.routes.js';
import { jobBidsRouter, bidsRouter } from './modules/bids/bids.routes.js';
import { connectsRouter } from './modules/connects/connects.routes.js';
import { profileRouter } from './modules/profile/profile.routes.js';
import { jobReviewRouter } from './modules/reviews/reviews.routes.js';
import { notFound, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientOrigin }));
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/jobs', jobsRouter);
  app.use('/api/jobs/:id/bids', jobBidsRouter);
  app.use('/api/jobs/:id/review', jobReviewRouter);
  app.use('/api/bids', bidsRouter);
  app.use('/api/connects', connectsRouter);
  app.use('/api/profile', profileRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
