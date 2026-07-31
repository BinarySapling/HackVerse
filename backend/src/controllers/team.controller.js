import teamService from '../services/team.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';

export const createTeam = asyncHandler(async (req, res) => {
  const leaderId = req.user.id;
  const { hackathonId } = req.params;
  const team = await teamService.createTeam(leaderId, hackathonId, req.body);
  return ApiResponse.success(res, HttpStatus.CREATED, 'Team created successfully', team);
});

export const getMyTeam = asyncHandler(async (req, res) => {
  const team = await teamService.getMyTeam(req.user.id, req.params.hackathonId);
  return ApiResponse.success(res, HttpStatus.OK, 'Team details fetched successfully', team);
});

export const getHackathonTeams = asyncHandler(async (req, res) => {
  const teams = await teamService.getHackathonTeams(
    req.params.hackathonId,
    req.user.id,
    req.user.role
  );
  return ApiResponse.success(res, HttpStatus.OK, 'Teams fetched successfully', teams);
});

export const addMember = asyncHandler(async (req, res) => {
  const updatedTeam = await teamService.addMember(req.params.teamId, req.user.id, req.body.memberId);
  return ApiResponse.success(res, HttpStatus.OK, 'Member added to team successfully', updatedTeam);
});

export const removeMember = asyncHandler(async (req, res) => {
  const updatedTeam = await teamService.removeMember(
    req.params.teamId,
    req.user.id,
    req.body.memberId
  );
  return ApiResponse.success(res, HttpStatus.OK, 'Member removed from team successfully', updatedTeam);
});

export const leaveTeam = asyncHandler(async (req, res) => {
  await teamService.leaveTeam(req.params.teamId, req.user.id);
  return ApiResponse.success(res, HttpStatus.OK, 'Left team successfully');
});

export const deleteTeam = asyncHandler(async (req, res) => {
  await teamService.deleteTeam(req.params.teamId, req.user.id, req.user.role);
  return ApiResponse.success(res, HttpStatus.OK, 'Team deleted successfully');
});

export const updateTeam = asyncHandler(async (req, res) => {
  const team = await teamService.updateTeam(req.params.teamId, req.user.id, req.body);
  return ApiResponse.success(res, HttpStatus.OK, 'Team updated successfully', team);
});

export const transferLeadership = asyncHandler(async (req, res) => {
  const team = await teamService.transferLeadership(
    req.params.teamId,
    req.user.id,
    req.body.newLeaderId
  );
  return ApiResponse.success(res, HttpStatus.OK, 'Leadership transferred successfully', team);
});

export default {
  createTeam,
  getMyTeam,
  getHackathonTeams,
  addMember,
  removeMember,
  leaveTeam,
  deleteTeam,
  updateTeam,
  transferLeadership,
};
