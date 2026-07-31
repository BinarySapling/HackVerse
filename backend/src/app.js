import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import config from './config/env.js';
import logger from './config/logger.js';
import requestIdMiddleware from './middleware/requestIdMiddleware.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/auth.routes.js';
import hackathonRoutes from './routes/hackathon.routes.js';
import registrationRoutes from './routes/registration.routes.js';
import teamRoutes from './routes/team.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import evaluationRoutes from './routes/evaluation.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import invitationRoutes from './routes/invitation.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import { notFound } from './middleware/notFoundMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.disable('x-powered-by');

if (config.trustProxy) {
  const trustProxyVal = /^\d+$/.test(config.trustProxy)
    ? parseInt(config.trustProxy, 10)
    : config.trustProxy;
  app.set('trust proxy', trustProxyVal);
}

app.use(requestIdMiddleware);
app.use(helmet());

// Allow listed frontend URLs (Vercel / localhost). Reflect request origin when "*" is set.
const corsOrigin = config.allowedOrigins.includes('*')
  ? true
  : config.allowedOrigins;

app.use(
  cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    credentials: true,
  })
);

app.use(compression());

morgan.token('id', (req) => req.requestId);

const morganFormat =
  config.nodeEnv === 'development'
    ? '[:id] :method :url :status :response-time ms'
    : '[:id] :remote-addr :method :url :status :response-time ms';

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hackathons', hackathonRoutes);
app.use('/api/v1', registrationRoutes);
app.use('/api/v1', teamRoutes);
app.use('/api/v1', submissionRoutes);
app.use('/api/v1', evaluationRoutes);
app.use('/api/v1', leaderboardRoutes);
app.use('/api/v1', invitationRoutes);
app.use('/api/v1', notificationRoutes);
app.use('/api/v1', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
