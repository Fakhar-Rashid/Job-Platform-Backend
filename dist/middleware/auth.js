import { verifyToken } from '../lib/token.js';
import { HttpError } from '../utils/httpError.js';
export const requireAuth = (req, _res, next) => {
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return next(new HttpError(401, 'Authentication required'));
    }
    try {
        const payload = verifyToken(token);
        req.user = { id: payload.sub };
        next();
    }
    catch {
        next(new HttpError(401, 'Invalid or expired token'));
    }
};
//# sourceMappingURL=auth.js.map