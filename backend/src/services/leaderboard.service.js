import hackathonRepository from '../repositories/hackathon.repository.js';
import teamRepository from '../repositories/team.repository.js';
import leaderboardRepository from '../repositories/leaderboard.repository.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import logger from '../config/logger.js';
import { assertOrganizerOwnsHackathonOrAdmin } from '../utils/authorization.js';
import HackathonStatus from '../constants/hackathonStatus.js';
import emailService from './email.service.js';
import notificationService from './notification.service.js';
import Team from '../models/Team.js';

const validateHackathon = async (hackathonId) => {
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError(
      'Hackathon not found',
      HttpStatus.NOT_FOUND,
      ErrorCodes.NOT_FOUND
    );
  }
  return hackathon;
};

export const getLeaderboard = async (userId, hackathonId, query) => {
  const hackathon = await validateHackathon(hackathonId);

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const result = await leaderboardRepository.getLeaderboard(hackathonId, skip, limit);

  logger.info(`Leaderboard Viewed [Hackathon: ${hackathonId}] [User: ${userId}]`);

  return {
    leaderboard: result.results,
    evaluationClosed: Boolean(hackathon.evaluationClosed),
    winnersAnnounced: Boolean(hackathon.winnersAnnounced),
    pagination: {
      total: result.total,
      page,
      limit,
      pages: Math.ceil(result.total / limit)
    }
  };
};

export const getOrganizerResults = async (userId, userRole, hackathonId, query) => {
  const hackathon = await validateHackathon(hackathonId);
  assertOrganizerOwnsHackathonOrAdmin(
    hackathon,
    userId,
    userRole,
    'Access denied: Only the hackathon organizer or an admin can view results'
  );

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const searchQuery = query.search || '';

  const result = await leaderboardRepository.getOrganizerResults(hackathonId, skip, limit, searchQuery);

  logger.info(`Results Viewed [Hackathon: ${hackathonId}] [Organizer: ${userId}]`);

  return {
    results: result.results,
    evaluationClosed: Boolean(hackathon.evaluationClosed),
    winnersAnnounced: Boolean(hackathon.winnersAnnounced),
    pagination: {
      total: result.total,
      page,
      limit,
      pages: Math.ceil(result.total / limit)
    }
  };
};

export const getMyResult = async (userId, hackathonId) => {
  await validateHackathon(hackathonId);

  const myTeam = await teamRepository.findByLeader(userId, hackathonId);
  if (!myTeam || myTeam.isDeleted) {
    throw new AppError(
      'You are not the leader of any active team in this hackathon',
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  const result = await leaderboardRepository.getTeamResult(hackathonId, myTeam._id);

  if (!result) {
    throw new AppError(
      'Your team does not have any evaluated submissions on the leaderboard yet',
      HttpStatus.NOT_FOUND,
      ErrorCodes.NOT_FOUND
    );
  }

  logger.info(`My Result Viewed [Hackathon: ${hackathonId}] [User: ${userId}] [Team: ${myTeam._id}]`);

  return result;
};

export const closeEvaluation = async (userId, userRole, hackathonId) => {
  const hackathon = await validateHackathon(hackathonId);
  assertOrganizerOwnsHackathonOrAdmin(
    hackathon,
    userId,
    userRole,
    'Access denied: Only the hackathon organizer or an admin can close evaluation'
  );

  if (hackathon.evaluationClosed) {
    throw new AppError(
      'Evaluation is already closed for this hackathon',
      HttpStatus.CONFLICT,
      ErrorCodes.CONFLICT
    );
  }

  const updated = await hackathonRepository.update(hackathonId, {
    evaluationClosed: true,
    status: HackathonStatus.COMPLETED
  });

  const leaderboard = await leaderboardRepository.getLeaderboard(hackathonId, 0, 100);

  await notificationService.createNotification({
    userId,
    type: 'evaluation_completed',
    title: 'Evaluation closed',
    message: `Evaluation for ${hackathon.title} is closed. Leaderboard is ready.`,
    meta: { hackathonId }
  });

  logger.info(`Evaluation Closed [Hackathon: ${hackathonId}] [Organizer: ${userId}]`);

  return {
    hackathon: updated,
    leaderboard: leaderboard.results
  };
};

export const announceWinners = async (userId, userRole, hackathonId) => {
  const hackathon = await validateHackathon(hackathonId);
  assertOrganizerOwnsHackathonOrAdmin(
    hackathon,
    userId,
    userRole,
    'Access denied: Only the hackathon organizer or an admin can announce winners'
  );

  if (!hackathon.evaluationClosed) {
    throw new AppError(
      'Close evaluation before announcing winners',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  if (hackathon.winnersAnnounced) {
    throw new AppError(
      'Winners have already been announced for this hackathon',
      HttpStatus.CONFLICT,
      ErrorCodes.CONFLICT
    );
  }

  const leaderboard = await leaderboardRepository.getLeaderboard(hackathonId, 0, 5);
  const topTeams = leaderboard.results || [];

  const detailed = await Promise.all(
    topTeams.map(async (entry) => {
      const team = await Team.findOne({ name: entry.teamName, hackathon: hackathonId, isDeleted: false })
        .populate('leader', 'firstName lastName email')
        .populate('members', 'firstName lastName email');
      return { ...entry, team };
    })
  );

  for (const winner of detailed) {
    const recipients = [];
    if (winner.team?.leader) recipients.push(winner.team.leader);
    if (winner.team?.members?.length) {
      winner.team.members.forEach((m) => {
        if (!recipients.some((r) => r._id.toString() === m._id.toString())) {
          recipients.push(m);
        }
      });
    }

    for (const recipient of recipients) {
      void emailService.sendWinnerAnnouncement({
        participant: recipient,
        hackathon,
        rank: winner.rank,
        score: winner.averageScore,
        teamName: winner.teamName
      });
      await notificationService.createNotification({
        userId: recipient._id,
        type: 'winner_announcement',
        title: `Congratulations! Rank #${winner.rank}`,
        message: `Your team ${winner.teamName} placed #${winner.rank} in ${hackathon.title} with score ${winner.averageScore}.`,
        meta: { hackathonId, rank: winner.rank, score: winner.averageScore }
      });
    }
  }

  const updated = await hackathonRepository.update(hackathonId, {
    winnersAnnounced: true,
    winnersAnnouncedAt: new Date(),
    status: HackathonStatus.COMPLETED
  });

  await notificationService.createNotification({
    userId,
    type: 'winners_generated',
    title: 'Winners announced',
    message: `Top ${detailed.length} teams announced for ${hackathon.title}.`,
    meta: {
      hackathonId,
      winners: detailed.map((w) => ({ rank: w.rank, teamName: w.teamName, score: w.averageScore }))
    }
  });

  logger.info(`Winners Announced [Hackathon: ${hackathonId}] [Count: ${detailed.length}] [Organizer: ${userId}]`);

  return {
    hackathon: updated,
    winners: detailed.map((w) => ({
      rank: w.rank,
      teamName: w.teamName,
      averageScore: w.averageScore,
      leader: w.leader
    }))
  };
};

export default {
  getLeaderboard,
  getOrganizerResults,
  getMyResult,
  closeEvaluation,
  announceWinners
};
