import config from '../config/env.js';

// Common options configuration helper for HTTP-only refresh tokens
const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    // Cross-origin SPA (e.g. :3001 → :5000) needs credentials + a non-strict SameSite.
    // 'none' requires Secure (HTTPS). Use 'lax' in development over HTTP.
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  };
};

export const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, getCookieOptions());
};

export const clearRefreshCookie = (res) => {
  const opts = getCookieOptions();
  res.clearCookie('refreshToken', {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
  });
};

export default {
  setRefreshCookie,
  clearRefreshCookie
};
