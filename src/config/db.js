import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUri, {
      maxPoolSize: 10,
      autoIndex: env.nodeEnv !== 'production',
    });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection error', err);
    process.exit(1);
  }
};





