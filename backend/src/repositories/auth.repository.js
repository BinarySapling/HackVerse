import User from '../models/User.js';

/**
 * @desc Find user profile in the database by email
 * @param {string} email - Email address of the user
 * @returns {Promise<Object|null>} User document or null if not found
 */
export const findByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * @desc Find user profile in the database by email and include password field explicitly
 * @param {string} email - Email address of the user
 * @returns {Promise<Object|null>} User document with password field included, or null if not found
 */
export const findUserByEmailWithPassword = async (email) => {
  return User.findOne({ email }).select('+password');
};

/**
 * @desc Find user by their MongoDB Object ID
 * @param {string} userId - Object ID of the user
 * @returns {Promise<Object|null>} User document or null if not found
 */
export const findUserById = async (userId) => {
  return User.findById(userId);
};

/**
 * @desc Find user by their active refresh token (selecting +refreshToken explicitly)
 * @param {string} token - Refresh token hash
 * @returns {Promise<Object|null>} User document or null if not found
 */
export const findUserByRefreshToken = async (token) => {
  return User.findOne({ refreshToken: token }).select('+refreshToken');
};

/**
 * @desc Insert a new user document into the database
 * @param {Object} userData - User attribute values payload
 * @returns {Promise<Object>} The created User document
 */
export const createUser = async (userData) => {
  return User.create(userData);
};

/**
 * @desc Update the last login timestamp of a user
 * @param {string} userId - Object ID of the user
 * @returns {Promise<Object|null>} The updated user document
 */
export const updateLastLogin = async (userId) => {
  return User.findByIdAndUpdate(userId, { lastLogin: new Date() }, { new: true });
};

/**
 * @desc Save a new refresh token for a user session
 * @param {string} userId - Object ID of the user
 * @param {string} token - New refresh token
 * @returns {Promise<Object|null>} The updated user document
 */
export const updateRefreshToken = async (userId, token) => {
  return User.findByIdAndUpdate(userId, { refreshToken: token }, { new: true });
};

/**
 * @desc Clear/invalidate a user's active refresh token session
 * @param {string} userId - Object ID of the user
 * @returns {Promise<Object|null>} The updated user document
 */
export const clearRefreshToken = async (userId) => {
  return User.findByIdAndUpdate(userId, { refreshToken: null }, { new: true });
};

export default {
  findByEmail,
  findUserByEmailWithPassword,
  findUserById,
  findUserByRefreshToken,
  createUser,
  updateLastLogin,
  updateRefreshToken,
  clearRefreshToken
};
