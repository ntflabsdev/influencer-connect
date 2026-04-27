import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(env.nodeEnv !== 'production' ? { stack: err.stack } : {}),
  });
};

