import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET'];

required.forEach((key) => {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.warn(`[env] Missing ${key} - set it in your environment`);
  }
});

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5500,
  mongoUri: process.env.MONGO_URI || 'mongodb+srv://aakashrajputntf:_9ZeTyyggsZ5nuL@cluster0.0ngxl.mongodb.net/mydb?appName=Cluster0',
  jwtSecret: process.env.JWT_SECRET || 'changeme',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3001',
  aws: {
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_S3_BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    from: process.env.SENDGRID_FROM,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUrl: process.env.GOOGLE_REDIRECT_URL,
  },
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    redirectUrl: process.env.INSTAGRAM_REDIRECT_URL,
  },
  tiktok: {
    clientId: process.env.TIKTOK_CLIENT_ID,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    redirectUrl: process.env.TIKTOK_REDIRECT_URL,
  },
};





