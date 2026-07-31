import invitationService from '../services/invitation.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';

export const inviteJudgeByEmail = asyncHandler(async (req, res) => {
  const invite = await invitationService.inviteJudgeByEmail(
    req.user.id,
    req.user.role,
    req.params.hackathonId,
    req.body.email
  );

  return ApiResponse.success(res, HttpStatus.CREATED, 'Judge invitation sent successfully', invite);
});

export const registerJudgeFromInvitation = asyncHandler(async (req, res) => {
  const user = await invitationService.registerJudgeFromInvitation(req.body.token, {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  });

  return ApiResponse.success(res, HttpStatus.CREATED, 'Judge registered and linked successfully', {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role
  });
});

export const respondToJudgeInvitation = asyncHandler(async (req, res) => {
  const invite = await invitationService.respondToJudgeInvitation(
    req.body.token,
    req.user.id,
    req.body.accepted
  );

  return ApiResponse.success(res, HttpStatus.OK, 'Judge invitation response saved successfully', invite);
});

export const inviteTeamMember = asyncHandler(async (req, res) => {
  const invite = await invitationService.inviteTeamMember(req.params.teamId, req.user.id, req.body.email);

  return ApiResponse.success(res, HttpStatus.CREATED, 'Team invitation sent successfully', invite);
});

export const respondToTeamInvitation = asyncHandler(async (req, res) => {
  const result = await invitationService.respondToTeamInvitation(req.body.token, req.user.id, req.body.accepted);

  return ApiResponse.success(res, HttpStatus.OK, 'Team invitation response saved successfully', result);
});

export default {
  inviteJudgeByEmail,
  registerJudgeFromInvitation,
  respondToJudgeInvitation,
  inviteTeamMember,
  respondToTeamInvitation
};
