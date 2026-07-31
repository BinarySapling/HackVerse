import authService from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';
import { setRefreshCookie, clearRefreshCookie } from '../utils/cookie.js';

export const signup = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role = 'participant' } = req.body;

  const result = await authService.registerUser({
    firstName,
    lastName,
    email,
    password,
    role,
  });

  const user = result.user;

  return ApiResponse.success(
    res,
    result.resent ? HttpStatus.OK : HttpStatus.CREATED,
    result.resent
      ? 'Account pending verification. A new OTP has been sent to your email.'
      : 'Registration successful. Check your email for a welcome message and OTP.',
    {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      verificationRequired: true,
      otpExpiresIn: result.otpExpiresIn,
      resendCooldown: result.otpExpiresIn,
    }
  );
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await authService.verifySignupEmail(email, otp);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    result.alreadyVerified
      ? 'Email is already verified. You can log in.'
      : 'Email verified successfully. You can now log in.',
    {
      id: result.user._id,
      email: result.user.email,
      isVerified: true,
    }
  );
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.resendSignupOtp(email);

  return ApiResponse.success(res, HttpStatus.OK, 'A new verification code has been sent.', {
    email: email.trim().toLowerCase(),
    otpExpiresIn: result.expiresIn,
    resendCooldown: result.expiresIn,
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

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id || req.user._id, currentPassword, newPassword);
  return ApiResponse.success(res, HttpStatus.OK, 'Password updated successfully');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.requestPasswordReset(email);
  return ApiResponse.success(
    res,
    HttpStatus.OK,
    'If that email is registered, a reset link has been sent.'
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPasswordWithToken(token, password);
  return ApiResponse.success(res, HttpStatus.OK, 'Password has been reset. You can log in now.');
});

export default {
  signup,
  verifyOtp,
  resendOtp,
  login,
  refresh,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
};
