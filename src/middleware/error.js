import { HttpError } from '../utils/httpError.js';

export function notFound(_req, _res, next) {
  next(new HttpError(404, 'Route not found'));
}

export function errorHandler(err, _req, res, _next) {
  const status = err instanceof HttpError ? err.status : 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  if (status === 500) console.error(err);
  res.status(status).json({ error: message });
}
