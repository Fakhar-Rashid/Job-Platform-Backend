import { HttpError } from '../utils/httpError.js';

export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = result.error.issues.map((i) => i.message).join(', ');
      return next(new HttpError(400, message));
    }
    req[source] = result.data;
    next();
  };
}
