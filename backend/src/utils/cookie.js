import config from '../config/env.js';

// Common options configuration helper for HTTP-only refresh tokens
const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  };
};

/**
 * @desc Set the secure HTTP-only refresh token cookie
 * @param {Object} res - Express response object
 * @param {string} token - Signed refresh token string
 */
export const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, getCookieOptions());
};

/**
 * @desc Clear the refresh token cookie
 * @param {Object} res - Express response object
 */
export const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict'
  });
};

export default {
  setRefreshCookie,
  clearRefreshCookie
};
