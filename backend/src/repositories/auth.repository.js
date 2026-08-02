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

export const findUserByIdWithPassword = async (userId) => {
  return User.findById(userId).select('+password');
};

export const updatePassword = async (userId, hashedPassword) => {
  return User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
};

export const markEmailVerified = async (userId) => {
  return User.findByIdAndUpdate(userId, { isVerified: true }, { new: true });
};

export const listUsers = async (filter = {}, skip = 0, limit = 50) => {
  return User.find({ isDeleted: false, ...filter })
    .select('firstName lastName email role isActive isVerified avatar createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const countUsers = async (filter = {}) => {
  return User.countDocuments({ isDeleted: false, ...filter });
};

export const setUserActive = async (userId, isActive) => {
  return User.findByIdAndUpdate(userId, { isActive }, { new: true }).select(
    'firstName lastName email role isActive isVerified'
  );
};

export const softDeleteUser = async (userId) => {
  return User.findByIdAndUpdate(
    userId,
    { isDeleted: true, isActive: false, refreshToken: null },
    { new: true }
  );
};

export const updateProfile = async (userId, updates) => {
  return User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).select('firstName lastName email role isVerified avatar');
};

export default {
  findByEmail,
  findUserByEmailWithPassword,
  findUserById,
  findUserByIdWithPassword,
  findUserByRefreshToken,
  createUser,
  updateLastLogin,
  updateRefreshToken,
  clearRefreshToken,
  updatePassword,
  markEmailVerified,
  listUsers,
  countUsers,
  setUserActive,
  softDeleteUser,
  updateProfile,
};
