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
import { notFound } from './middleware/notFoundMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Disable x-powered-by headers explicitly
app.disable('x-powered-by');

// Configure Trust Proxy defaults for secure routing headers behind proxies
if (config.trustProxy) {
  const trustProxyVal = /^\d+$/.test(config.trustProxy) ? parseInt(config.trustProxy, 10) : config.trustProxy;
  app.set('trust proxy', trustProxyVal);
}

// 1. Assign Correlation Request ID (placed first in middleware pipeline)
app.use(requestIdMiddleware);

// 2. Security HTTP Headers
app.use(helmet());

// 3. CORS Integration
app.use(cors({
  origin: config.allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  credentials: true
}));

// 4. Response Compression (should occur early to compress all downstream responses)
app.use(compression());

// Register custom request ID token for Morgan formatting
morgan.token('id', (req) => req.requestId);

// 5. HTTP Request Logging (piped into Winston with request ID prefix)
const morganFormat = config.nodeEnv === 'development'
  ? '[:id] :method :url :status :response-time ms - :res[content-length]'
  : '[:id] :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// 6. Cookie Parser (processes cookie headers prior to body parsing or routing)
app.use(cookieParser());

// 7. Request Body Parsing (with secure size limits)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 8. Register Router endpoints
app.use('/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hackathons', hackathonRoutes);
app.use('/api/v1', registrationRoutes);
app.use('/api/v1', teamRoutes);
app.use('/api/v1', submissionRoutes);
app.use('/api/v1', evaluationRoutes);
app.use('/api/v1', leaderboardRoutes);

// 9. 404 Catch-all Middleware
app.use(notFound);

// 10. Centralized Global Error Handler Middleware
app.use(errorHandler);

export default app;
