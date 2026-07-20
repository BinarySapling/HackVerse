import config from './env.js';

/**
 * @desc Configuration parameters for access and refresh JSON Web Tokens
 */
export const jwtConfig = {
  access: {
    secret: config.jwtAccessSecret,
    expiresIn: config.jwtAccessExpire
  },
  refresh: {
    secret: config.jwtRefreshSecret,
    expiresIn: config.jwtRefreshExpire
  }
};

export default jwtConfig;
