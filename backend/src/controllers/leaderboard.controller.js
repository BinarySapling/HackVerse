import leaderboardService from '../services/leaderboard.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';

/**
 * @desc Handle HTTP GET fetch public leaderboard
 * @route GET /api/v1/hackathons/:hackathonId/leaderboard
 * @access Protected (Authenticated users)
 */
export const getLeaderboard = asyncHandler(async (req, res) => {
  const { hackathonId } = req.params;
  const userId = req.user.id;

  const result = await leaderboardService.getLeaderboard(userId, hackathonId, req.query);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Leaderboard fetched successfully",
    result.leaderboard,
    result.pagination
  );
});

/**
 * @desc Handle HTTP GET fetch detailed organizer results
 * @route GET /api/v1/hackathons/:hackathonId/results
 * @access Protected (Organizer/Admin only)
 */
export const getOrganizerResults = asyncHandler(async (req, res) => {
  const { hackathonId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const result = await leaderboardService.getOrganizerResults(userId, userRole, hackathonId, req.query);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Organizer results fetched successfully",
    result.results,
    result.pagination
  );
});

/**
 * @desc Handle HTTP GET fetch specific team result for the leader
 * @route GET /api/v1/hackathons/:hackathonId/my-result
 * @access Protected (Leader only)
 */
export const getMyResult = asyncHandler(async (req, res) => {
  const { hackathonId } = req.params;
  const userId = req.user.id;

  const result = await leaderboardService.getMyResult(userId, hackathonId);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Team result fetched successfully",
    result
  );
});

export default {
  getLeaderboard,
  getOrganizerResults,
  getMyResult
};
