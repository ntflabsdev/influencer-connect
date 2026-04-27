import rateLimit from 'express-rate-limit';

const makeLimiter = (limit, windowMs = 15 * 60 * 1000) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
  });

export const publicLimiter = makeLimiter(300);
export const authLimiter = makeLimiter(200);
export const influencerLimiter = makeLimiter(120);
export const businessLimiter = makeLimiter(120);
export const adminLimiter = makeLimiter(300);





