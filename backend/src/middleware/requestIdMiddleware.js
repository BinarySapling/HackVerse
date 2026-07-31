import crypto from 'crypto';

export const requestIdMiddleware = (req, res, next) => {
  // Reuse client-supplied request-id for correlation if available, otherwise generate a new UUID
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  
  next();
};

export default requestIdMiddleware;
