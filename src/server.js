import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';
import { logger } from './utils/logger.js';

const start = async () => {
  await connectDB();
  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
  });
};

start();





