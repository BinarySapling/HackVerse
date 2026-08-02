import leaderboardService from '../services/leaderboard.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';

export const getLeaderboard = asyncHandler(async (req, res) => {
  const { hackathonId } = req.params;
  const userId = req.user?.id || null;

  const result = await leaderboardService.getLeaderboard(userId, hackathonId, req.query);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Leaderboard fetched successfully",
    result.leaderboard,
    {
      ...result.pagination,
      evaluationClosed: result.evaluationClosed,
      winnersAnnounced: result.winnersAnnounced
    }
  );
});

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
    {
      ...result.pagination,
      evaluationClosed: result.evaluationClosed,
      winnersAnnounced: result.winnersAnnounced
    }
  );
});

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

export const closeEvaluation = asyncHandler(async (req, res) => {
  const result = await leaderboardService.closeEvaluation(
    req.user.id,
    req.user.role,
    req.params.hackathonId
  );

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    'Evaluation closed successfully',
    result
  );
});

export const announceWinners = asyncHandler(async (req, res) => {
  const result = await leaderboardService.announceWinners(
    req.user.id,
    req.user.role,
    req.params.hackathonId
  );

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    'Winners announced successfully',
    result
  );
});

export default {
  getLeaderboard,
  getOrganizerResults,
  getMyResult,
  closeEvaluation,
  announceWinners
};
