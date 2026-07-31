import dashboardService from '../services/dashboard.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.user.id, req.user.role);
  return ApiResponse.success(res, HttpStatus.OK, 'Dashboard stats retrieved successfully', stats);
});

export default { getDashboardStats };
