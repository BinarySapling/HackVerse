import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';

/**
 * @desc Sign a new JSON Web Token access token (short-lived)
 * @param {Object} payload - Token payload (e.g. { id, role })
 * @returns {string} Signed JWT token string
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, jwtConfig.access.secret, {
    expiresIn: jwtConfig.access.expiresIn
  });
};

/**
 * @desc Sign a new JSON Web Token refresh token (long-lived)
 * @param {Object} payload - Token payload (e.g. { id })
 * @returns {string} Signed JWT token string
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtConfig.refresh.secret, {
    expiresIn: jwtConfig.refresh.expiresIn
  });
};

/**
 * @desc Validate and decode a signed JSON Web Token access token
 * @param {string} token - Access token string
 * @returns {Object} Decoded payload details
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, jwtConfig.access.secret);
};

/**
 * @desc Validate and decode a signed JSON Web Token refresh token
 * @param {string} token - Refresh token string
 * @returns {Object} Decoded payload details
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, jwtConfig.refresh.secret);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
