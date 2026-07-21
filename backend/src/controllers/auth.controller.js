import authService from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';
import { setRefreshCookie, clearRefreshCookie } from '../utils/cookie.js';

/**
 * @desc Handle HTTP POST registration request
 * @route POST /api/v1/auth/signup
 * @access Public
 */
export const signup = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Destructure attributes explicitly to prevent clients from injecting arbitrary fields
  const createdUser = await authService.registerUser({
    firstName,
    lastName,
    email,
    password
  });

  // Construct standard sanitized user response payload
  const responsePayload = {
    id: createdUser._id,
    firstName: createdUser.firstName,
    lastName: createdUser.lastName,
    email: createdUser.email,
    role: createdUser.role,
    isVerified: createdUser.isVerified
  };

  return ApiResponse.success(
    res,
    HttpStatus.CREATED,
    "User registered successfully",
    responsePayload
  );
});

/**
 * @desc Handle HTTP POST login request
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

  // Set HTTP-only Cookie containing Refresh Token via reusable utility helper
  setRefreshCookie(res, refreshToken);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Login successful",
    {
      user,
      accessToken
    }
  );
});

/**
 * @desc Handle HTTP POST refresh token rotation request
 * @route POST /api/v1/auth/refresh
 * @access Public
 */
export const refresh = asyncHandler(async (req, res) => {
  const currentRefreshToken = req.cookies.refreshToken;

  const { accessToken, refreshToken } = await authService.refreshUserSession(currentRefreshToken);

  // Rotate HTTP-only Cookie with new Refresh Token via reusable utility helper
  setRefreshCookie(res, refreshToken);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Session token rotated successfully",
    {
      accessToken
    }
  );
});

/**
 * @desc Handle HTTP POST logout session invalidation
 * @route POST /api/v1/auth/logout
 * @access Public
 */
export const logout = asyncHandler(async (req, res) => {
  const currentRefreshToken = req.cookies.refreshToken;

  await authService.logoutUser(currentRefreshToken);

  // Clear HTTP-only Cookie via reusable utility helper
  clearRefreshCookie(res);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Logout successful"
  );
});

/**
 * @desc Fetch current authenticated user profile
 * @route GET /api/v1/auth/me
 * @access Protected
 */
export const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Authenticated user fetched successfully",
    req.user
  );
});

export default {
  signup,
  login,
  refresh,
  logout,
  getMe
};
