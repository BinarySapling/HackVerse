import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvVars = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:');
  missingEnvVars.forEach((v) => console.error(` - ${v}`));
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV || 'development';

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv,
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ],
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtAccessExpire: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  mongoUri: process.env.MONGO_URI,
  trustProxy: process.env.TRUST_PROXY || '1',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  mail: {
    fromName: process.env.MAIL_FROM_NAME || 'HackVerse',
    fromEmail: process.env.MAIL_FROM_EMAIL,
    supportEmail: process.env.MAIL_FROM_EMAIL || 'support@hackverse.local',
  },
  cloudinary: {
    url: process.env.CLOUDINARY_URL || process.env.CLOUDINARY_API,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API,
    apiSecret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'hackverse',
  },
  upstash: {
    restUrl: process.env.UPSTASH_REDIS_REST_URL,
    restToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
  otp: {
    ttlSeconds: parseInt(process.env.OTP_TTL_SECONDS, 10) || 180,
    resendCooldownSeconds: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS, 10) || 180,
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5,
  },
};

if (nodeEnv === 'production') {
  const placeholderPattern = /change_me|your[-_]?secret|example/i;
  if (
    placeholderPattern.test(config.jwtAccessSecret) ||
    placeholderPattern.test(config.jwtRefreshSecret)
  ) {
    console.warn(
      '[env] JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be strong random values in production.'
    );
  }
  if (!process.env.ALLOWED_ORIGINS) {
    console.warn(
      '[env] ALLOWED_ORIGINS is unset — CORS allows all origins. Set your frontend URL(s).'
    );
  }
}

export default config;
