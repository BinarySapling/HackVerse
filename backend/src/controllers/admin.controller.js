import adminService from '../services/admin.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';

export const listTeams = asyncHandler(async (req, res) => {
  const result = await adminService.listAllTeams(req.query);
  return ApiResponse.success(
    res,
    HttpStatus.OK,
    'Teams retrieved successfully',
    result.teams,
    result.pagination
  );
});

export const listSubmissions = asyncHandler(async (req, res) => {
  const result = await adminService.listAllSubmissions(req.query);
  return ApiResponse.success(
    res,
    HttpStatus.OK,
    'Submissions retrieved successfully',
    result.submissions,
    result.pagination
  );
});

export default { listTeams, listSubmissions };
