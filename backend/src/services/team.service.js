import teamRepository from '../repositories/team.repository.js';
import hackathonRepository from '../repositories/hackathon.repository.js';
import registrationRepository from '../repositories/registration.repository.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import logger from '../config/logger.js';
import { isAdmin } from '../utils/authorization.js';

export const createTeam = async (leaderId, hackathonId, payload) => {
  const { name } = payload;

  // 1. Verify that the leader is registered (approved) for the hackathon
  const registration = await registrationRepository.findByUserAndHackathon(leaderId, hackathonId);
  if (!registration || registration.status !== 'registered') {
    throw new AppError(
      registration?.status === 'pending'
        ? 'Your registration is still pending approval'
        : 'You must be an approved registrant to create a team',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // 2. Verify that the leader is not already in another team for this hackathon
  const existingTeam = await teamRepository.findByMember(leaderId, hackathonId);
  if (existingTeam) {
    throw new AppError(
      "You already belong to a team in this hackathon",
      HttpStatus.CONFLICT,
      ErrorCodes.CONFLICT
    );
  }

  // 3. Verify team name uniqueness in this hackathon
  const nameExists = await teamRepository.existsByNameInHackathon(name, hackathonId);
  if (nameExists) {
    throw new AppError(
      "Team name is already taken in this hackathon",
      HttpStatus.CONFLICT,
      ErrorCodes.CONFLICT
    );
  }

  // 4. Retrieve hackathon rules for team limits
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError(
      "Hackathon not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.NOT_FOUND
    );
  }

  // 5. Save the team document
  const team = await teamRepository.create({
    name,
    hackathon: hackathonId,
    leader: leaderId,
    members: [leaderId],
    maxMembers: hackathon.maxTeamSize
  });

  logger.info(`Team Created: "${team.name}" [ID: ${team._id}] [Leader: ${leaderId}]`);
  return team;
};

export const getMyTeam = async (userId, hackathonId) => {
  const team = await teamRepository.findByMember(userId, hackathonId);
  if (!team) {
    throw new AppError(
      "You do not belong to any team in this hackathon",
      HttpStatus.NOT_FOUND,
      ErrorCodes.NOT_FOUND
    );
  }
  return team;
};

export const addMember = async (teamId, leaderId, memberId) => {
  // 1. Fetch team details
  const team = await teamRepository.findById(teamId);
  if (!team || team.isDeleted) {
    throw new AppError("Team not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  // 2. Validate leader permissions
  const teamLeaderId = team.leader._id || team.leader;
  if (teamLeaderId.toString() !== leaderId.toString()) {
    logger.warn(`Unauthorized member addition attempt on team "${teamId}" by user "${leaderId}"`);
    throw new AppError(
      "Access denied: Only the team leader can add members",
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  const hackathonId = team.hackathon._id || team.hackathon;

  // 3. Verify added member has approved registration for the hackathon
  const registration = await registrationRepository.findByUserAndHackathon(memberId, hackathonId);
  if (!registration || registration.status !== 'registered') {
    throw new AppError(
      !registration
        ? 'Member is not registered for this hackathon'
        : registration.status === 'pending'
          ? 'Member registration is still pending approval'
          : 'Member is not an approved registrant for this hackathon',
      !registration ? HttpStatus.BAD_REQUEST : HttpStatus.FORBIDDEN,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // 4. Verify added member does not belong to another team
  const existingTeam = await teamRepository.findByMember(memberId, hackathonId);
  if (existingTeam) {
    throw new AppError(
      "Member already belongs to another team in this hackathon",
      HttpStatus.CONFLICT,
      ErrorCodes.CONFLICT
    );
  }

  // 5. Verify team capacity limits
  if (team.members.length >= team.maxMembers) {
    throw new AppError(
      "Team has reached its maximum size limit",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // 6. Save updates
  const updatedTeam = await teamRepository.addMember(teamId, memberId);

  logger.info(`Member Added: User "${memberId}" added to team "${teamId}" by leader "${leaderId}"`);
  return updatedTeam;
};

export const removeMember = async (teamId, leaderId, memberId) => {
  // 1. Fetch team details
  const team = await teamRepository.findById(teamId);
  if (!team || team.isDeleted) {
    throw new AppError("Team not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  // 2. Validate leader permissions
  const teamLeaderId = team.leader._id || team.leader;
  if (teamLeaderId.toString() !== leaderId.toString()) {
    logger.warn(`Unauthorized member removal attempt on team "${teamId}" by user "${leaderId}"`);
    throw new AppError(
      "Access denied: Only the team leader can remove members",
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  // 3. Verify member exists in the team
  const isMember = team.members.some((m) => (m._id || m).toString() === memberId.toString());
  if (!isMember) {
    throw new AppError(
      "Member is not part of this team",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // 4. Prevent leader from removing themselves
  if (teamLeaderId.toString() === memberId.toString()) {
    throw new AppError(
      "The leader cannot be removed from the team",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // 5. Only allow removals before registration closes
  const hackathon = await hackathonRepository.findById(team.hackathon._id || team.hackathon);
  if (hackathon && new Date() > new Date(hackathon.registrationEnd)) {
    throw new AppError(
      'Cannot remove members after registration has closed',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // 6. Remove member
  const updatedTeam = await teamRepository.removeMember(teamId, memberId);

  logger.info(`Member Removed: User "${memberId}" removed from team "${teamId}" by leader "${leaderId}"`);
  return updatedTeam;
};

export const leaveTeam = async (teamId, memberId) => {
  // 1. Fetch team details
  const team = await teamRepository.findById(teamId);
  if (!team || team.isDeleted) {
    throw new AppError("Team not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  // 2. Verify member belongs to this team
  const isMember = team.members.some((m) => (m._id || m).toString() === memberId.toString());
  if (!isMember) {
    throw new AppError(
      "You do not belong to this team",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // 3. Prevent leader from leaving
  const teamLeaderId = team.leader._id || team.leader;
  if (teamLeaderId.toString() === memberId.toString()) {
    throw new AppError(
      "The leader cannot leave the team",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // 4. Pull member out of array
  await teamRepository.removeMember(teamId, memberId);

  logger.info(`Member Left: User "${memberId}" left team "${teamId}" successfully`);
};

export const deleteTeam = async (teamId, userId, userRole) => {
  // 1. Fetch team details
  const team = await teamRepository.findById(teamId);
  if (!team || team.isDeleted) {
    throw new AppError("Team not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  // 2. Validate permissions (leader or admin)
  const teamLeaderId = team.leader._id || team.leader;
  const isLeader = teamLeaderId.toString() === userId.toString();
  const hasAdminBypass = isAdmin(userRole);

  if (!isLeader && !hasAdminBypass) {
    logger.warn(`Unauthorized delete attempt on team "${teamId}" by user "${userId}"`);
    throw new AppError(
      "Access denied: Only the team leader or an admin can delete this team",
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  // 3. Execute soft delete
  await teamRepository.softDelete(teamId);

  logger.info(`Team Deleted: "${team.name}" [ID: ${teamId}] [Deleted by: ${userId}]`);
};

export const updateTeam = async (teamId, leaderId, payload) => {
  const { name } = payload;

  const team = await teamRepository.findById(teamId);
  if (!team || team.isDeleted) {
    throw new AppError('Team not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  const teamLeaderId = team.leader._id || team.leader;
  if (teamLeaderId.toString() !== leaderId.toString()) {
    throw new AppError(
      'Access denied: Only the team leader can update the team',
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  const hackathonId = team.hackathon._id || team.hackathon;
  const nameExists = await teamRepository.existsByNameInHackathon(name, hackathonId, teamId);
  if (nameExists) {
    throw new AppError(
      'Team name is already taken in this hackathon',
      HttpStatus.CONFLICT,
      ErrorCodes.CONFLICT
    );
  }

  const updatedTeam = await teamRepository.updateName(teamId, name.trim());
  logger.info(`Team Updated: "${name}" [ID: ${teamId}] [Leader: ${leaderId}]`);
  return updatedTeam;
};

export const transferLeadership = async (teamId, leaderId, newLeaderId) => {
  const team = await teamRepository.findById(teamId);
  if (!team || team.isDeleted) {
    throw new AppError('Team not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  const currentLeaderId = (team.leader._id || team.leader).toString();
  if (currentLeaderId !== leaderId.toString()) {
    throw new AppError(
      'Only the current leader can transfer leadership',
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  const isMember = team.members.some((m) => (m._id || m).toString() === newLeaderId.toString());
  if (!isMember) {
    throw new AppError(
      'New leader must already be a team member',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  if (newLeaderId.toString() === currentLeaderId) {
    throw new AppError(
      'User is already the team leader',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const updated = await teamRepository.transferLeadership(teamId, newLeaderId);
  logger.info(`Leadership transferred on team ${teamId} to ${newLeaderId}`);
  return updated;
};

export const getHackathonTeams = async (hackathonId, userId, userRole) => {
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError('Hackathon not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  const organizerId = (hackathon.organizer._id || hackathon.organizer).toString();
  if (!isAdmin(userRole) && organizerId !== userId.toString()) {
    throw new AppError(
      'Only the organizer can view teams',
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  return teamRepository.findByHackathon(hackathonId);
};

export default {
  createTeam,
  getMyTeam,
  addMember,
  removeMember,
  leaveTeam,
  deleteTeam,
  updateTeam,
  transferLeadership,
  getHackathonTeams,
};
