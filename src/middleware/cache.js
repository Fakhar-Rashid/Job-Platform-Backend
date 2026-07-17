export function cacheControl(value) {
  return (_req, res, next) => {
    res.set('Cache-Control', value);
    next();
  };
}

export const noStore = cacheControl('no-store');
export const publicShort = cacheControl('public, max-age=10, stale-while-revalidate=30');
