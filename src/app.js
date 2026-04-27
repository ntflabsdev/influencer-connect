import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { publicLimiter, authLimiter } from './middlewares/rateLimiters.js';
import './config/passport.js'; // Initialize Passport strategies
import authRoutes from './routes/auth.routes.js';
import influencerRoutes from './routes/influencer.routes.js';
import businessRoutes from './routes/business.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import messageRoutes from './routes/message.routes.js';
import reviewRoutes from './routes/review.routes.js';
import disputeRoutes from './routes/dispute.routes.js';
import kycRoutes from './routes/kyc.routes.js';
import socialRoutes from './routes/social.routes.js';

const app = express();

app.set('view engine', 'ejs');

app.use(helmet());
console.log('CORS allowed origin:', env.clientUrl);
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);
app.use(compression());
// Webhook needs raw body; handled inside paymentRoutes before json middleware
// Inject raw body for Stripe webhooks only
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    express
      .raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json({ limit: '2mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Initialize Passport
app.use(passport.initialize());

app.use(publicLimiter);

app.get('/health', (req, res) => res.json({ status: 'ok', env: env.nodeEnv }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/influencer', influencerRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/social', socialRoutes);

app.use(errorHandler);

export default app;

