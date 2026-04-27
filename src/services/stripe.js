import Stripe from 'stripe';
import { env } from '../config/env.js';

export const stripe = new Stripe(env.stripe.secretKey, {
  apiVersion: '2024-06-20',
});





