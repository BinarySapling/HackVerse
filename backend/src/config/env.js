import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from backend root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Identify required environment variables for production-readiness
const requiredEnvVars = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('==================================================');
  console.error('  CRITICAL STARTUP ERROR: Missing Environment Variables');
  console.error('  The following environment variable(s) must be defined:');
  missingEnvVars.forEach(v => console.error(`    - ${v}`));
  console.error('  Server startup aborted.');
  console.error('==================================================');
  process.exit(1);
}

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtAccessExpire: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  mongoUri: process.env.MONGO_URI,
  trustProxy: process.env.TRUST_PROXY || '1',
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  mail: {
    fromName: process.env.MAIL_FROM_NAME || 'HackVerse',
    fromEmail: process.env.MAIL_FROM_EMAIL,
    supportEmail: process.env.MAIL_FROM_EMAIL || 'support@hackverse.local'
  }
};

export default config;
