import authService from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';
import { setRefreshCookie, clearRefreshCookie } from '../utils/cookie.js';

export const signup = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role = 'participant' } = req.body;

  const createdUser = await authService.registerUser({
    firstName,
    lastName,
    email,
    password,
    role,
  });

  return ApiResponse.success(res, HttpStatus.CREATED, 'User registered successfully', {
    id: createdUser._id,
    firstName: createdUser.firstName,
    lastName: createdUser.lastName,
    email: createdUser.email,
    role: createdUser.role,
    isVerified: createdUser.isVerified,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

  setRefreshCookie(res, refreshToken);

  return ApiResponse.success(res, HttpStatus.OK, 'Login successful', {
    user,
    accessToken,
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const currentRefreshToken = req.cookies.refreshToken;
  const { accessToken, refreshToken } = await authService.refreshUserSession(currentRefreshToken);

  setRefreshCookie(res, refreshToken);

  return ApiResponse.success(res, HttpStatus.OK, 'Session token rotated successfully', {
    accessToken,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const currentRefreshToken = req.cookies.refreshToken;
  await authService.logoutUser(currentRefreshToken);
  clearRefreshCookie(res);
  return ApiResponse.success(res, HttpStatus.OK, 'Logout successful');
});

export const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, HttpStatus.OK, 'Authenticated user fetched successfully', req.user);
});

export default {
  signup,
  login,
  refresh,
  logout,
  getMe,
};
