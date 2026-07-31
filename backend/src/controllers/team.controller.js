import teamService from '../services/team.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';

export const createTeam = asyncHandler(async (req, res) => {
  const leaderId = req.user.id;
  const { hackathonId } = req.params;

  const team = await teamService.createTeam(leaderId, hackathonId, req.body);

  return ApiResponse.success(
    res,
    HttpStatus.CREATED,
    "Team created successfully",
    team
  );
});

export const getMyTeam = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { hackathonId } = req.params;

  const team = await teamService.getMyTeam(userId, hackathonId);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Team details fetched successfully",
    team
  );
});

export const addMember = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const leaderId = req.user.id;
  const { memberId } = req.body;

  const updatedTeam = await teamService.addMember(teamId, leaderId, memberId);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Member added to team successfully",
    updatedTeam
  );
});

export const removeMember = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const leaderId = req.user.id;
  const { memberId } = req.body;

  const updatedTeam = await teamService.removeMember(teamId, leaderId, memberId);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Member removed from team successfully",
    updatedTeam
  );
});

export const leaveTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const memberId = req.user.id;

  await teamService.leaveTeam(teamId, memberId);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Left team successfully"
  );
});

export const deleteTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  await teamService.deleteTeam(teamId, userId, userRole);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Team deleted successfully"
  );
});

export default {
  createTeam,
  getMyTeam,
  addMember,
  removeMember,
  leaveTeam,
  deleteTeam
};
