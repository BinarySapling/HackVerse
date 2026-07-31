import User from '../models/User.js';

export const findByEmail = async (email) => {
  return User.findOne({ email });
};

export const findUserByEmailWithPassword = async (email) => {
  return User.findOne({ email }).select('+password');
};

export const findUserById = async (userId) => {
  return User.findById(userId);
};

export const findUserByRefreshToken = async (token) => {
  return User.findOne({ refreshToken: token }).select('+refreshToken');
};

export const createUser = async (userData) => {
  return User.create(userData);
};

export const updateLastLogin = async (userId) => {
  return User.findByIdAndUpdate(userId, { lastLogin: new Date() }, { new: true });
};

export const updateRefreshToken = async (userId, token) => {
  return User.findByIdAndUpdate(userId, { refreshToken: token }, { new: true });
};

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
