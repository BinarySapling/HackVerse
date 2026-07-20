import winston from 'winston';
import config from './env.js';

// Custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Set logging level based on the environment
const getLogLevel = () => {
  const isDevelopment = config.nodeEnv === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Custom level colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Format for local development (human-readable, colorized, request ID included if available)
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => {
      const reqIdStr = info.requestId ? ` [ReqID: ${info.requestId}]` : '';
      return `[${info.timestamp}] [${info.level}]${reqIdStr}: ${info.message}`;
    }
  )
);

// Format for production (structured, JSON-formatted, automatically embeds meta fields like requestId)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const activeFormat = config.nodeEnv === 'development' ? developmentFormat : productionFormat;

const transports = [
  new winston.transports.Console()
];

const logger = winston.createLogger({
  level: getLogLevel(),
  levels,
  format: activeFormat,
  transports
});

export default logger;
