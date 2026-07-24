import hackathonRepository from '../repositories/hackathon.repository.js';
import teamRepository from '../repositories/team.repository.js';
import leaderboardRepository from '../repositories/leaderboard.repository.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import logger from '../config/logger.js';
import { assertOrganizerOwnsHackathonOrAdmin } from '../utils/authorization.js';

const validateHackathon = async (hackathonId) => {
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError(
      "Hackathon not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.NOT_FOUND
    );
  }
  return hackathon;
};

/**
 * @desc Retrieve the public leaderboard for a hackathon
 */
export const getLeaderboard = async (userId, hackathonId, query) => {
  await validateHackathon(hackathonId);

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const result = await leaderboardRepository.getLeaderboard(hackathonId, skip, limit);

  logger.info(`Leaderboard Viewed [Hackathon: ${hackathonId}] [User: ${userId}]`);

  return {
    leaderboard: result.results,
    pagination: {
      total: result.total,
      page,
      limit,
      pages: Math.ceil(result.total / limit)
    }
  };
};

/**
 * @desc Retrieve detailed organizer results (Organizer/Admin only)
 */
export const getOrganizerResults = async (userId, userRole, hackathonId, query) => {
  const hackathon = await validateHackathon(hackathonId);
  assertOrganizerOwnsHackathonOrAdmin(
    hackathon,
    userId,
    userRole,
    "Access denied: Only the hackathon organizer or an admin can view results"
  );

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const searchQuery = query.search || '';

  const result = await leaderboardRepository.getOrganizerResults(hackathonId, skip, limit, searchQuery);

  logger.info(`Results Viewed [Hackathon: ${hackathonId}] [Organizer: ${userId}]`);

  return {
    results: result.results,
    pagination: {
      total: result.total,
      page,
      limit,
      pages: Math.ceil(result.total / limit)
    }
  };
};

/**
 * @desc Retrieve the team's ranking and result (Leader only)
 */
export const getMyResult = async (userId, hackathonId) => {
  await validateHackathon(hackathonId);

  // Validate that the user is a leader of a team in this hackathon
  const myTeam = await teamRepository.findByLeader(userId, hackathonId);
  if (!myTeam || myTeam.isDeleted) {
    throw new AppError(
      "You are not the leader of any active team in this hackathon",
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  const result = await leaderboardRepository.getTeamResult(hackathonId, myTeam._id);
  
  if (!result) {
    throw new AppError(
      "Your team does not have any evaluated submissions on the leaderboard yet",
      HttpStatus.NOT_FOUND,
      ErrorCodes.NOT_FOUND
    );
  }

  logger.info(`My Result Viewed [Hackathon: ${hackathonId}] [User: ${userId}] [Team: ${myTeam._id}]`);

  return result;
};

export default {
  getLeaderboard,
  getOrganizerResults,
  getMyResult
};
