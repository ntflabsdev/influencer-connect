import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { env } from '../config/env.js';

export const signToken = (payload, options = {}) =>
  jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    ...options,
  });

export const signShortLived = (payload, expiresIn = '15m') =>
  jwt.sign(payload, env.jwtSecret, { expiresIn });

export const randomToken = () => randomUUID().replace(/-/g, '');

