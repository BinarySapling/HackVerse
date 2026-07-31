import crypto from 'crypto';
import Invitation from '../models/Invitation.js';
import User from '../models/User.js';
import hackathonRepository from '../repositories/hackathon.repository.js';
import teamRepository from '../repositories/team.repository.js';
import authService, { hashToken } from './auth.service.js';
import teamService from './team.service.js';
import emailService from './email.service.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import Roles from '../constants/roles.js';
import { isAdmin } from '../utils/authorization.js';
import notificationService from './notification.service.js';

const INVITE_TTL_HOURS = 72;

const createToken = () => crypto.randomBytes(32).toString('hex');

const expiryDate = () => new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000);

const assertActiveInvite = (invite) => {
  if (!invite) {
    throw new AppError('Invalid invitation token', HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
  }
  if (invite.status !== 'pending') {
    throw new AppError('Invitation has already been used', HttpStatus.CONFLICT, ErrorCodes.CONFLICT);
  }
  if (invite.expiresAt <= new Date()) {
    invite.status = 'expired';
    invite.save().catch(() => {});
    throw new AppError('Invitation has expired', HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
  }
};

const createInvite = async ({ type, email, hackathonId, teamId = null, invitedBy }) => {
  const token = createToken();
  const invite = await Invitation.create({
    type,
    email: email.trim().toLowerCase(),
    tokenHash: hashToken(token),
    hackathon: hackathonId,
    team: teamId,
    invitedBy,
    expiresAt: expiryDate()
  });
  return { invite, token };
};

export const inviteJudgeByEmail = async (organizerId, organizerRole, hackathonId, email) => {
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError('Hackathon not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  const organizerObjectId = hackathon.organizer._id || hackathon.organizer;
  const ownsHackathon = organizerObjectId.toString() === organizerId.toString();
  if (!ownsHackathon && !isAdmin(organizerRole)) {
    throw new AppError('Access denied: Only the hackathon organizer or an admin can invite judges', HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingJudge = await User.findOne({ email: normalizedEmail, isDeleted: false });

  if (existingJudge && existingJudge.role !== Roles.JUDGE) {
    throw new AppError('This email belongs to a non-judge account', HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
  }

  if (existingJudge) {
    const alreadyAssigned = hackathon.judges?.some((judge) => judge.toString() === existingJudge._id.toString());
    if (alreadyAssigned) {
      throw new AppError('Judge is already assigned to this hackathon', HttpStatus.CONFLICT, ErrorCodes.CONFLICT);
    }
  }

  const pendingInvite = await Invitation.findOne({
    type: 'judge',
    email: normalizedEmail,
    hackathon: hackathonId,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  });
  if (pendingInvite) {
    throw new AppError('A pending invitation already exists for this email', HttpStatus.CONFLICT, ErrorCodes.CONFLICT);
  }

  const { invite, token } = await createInvite({
    type: 'judge',
    email: normalizedEmail,
    hackathonId,
    invitedBy: organizerId
  });

  void emailService.sendInvitationLink({
    type: existingJudge ? 'judge_invitation' : 'judge_registration',
    to: normalizedEmail,
    hackathon,
    token
  });

  return { id: invite._id, email: invite.email, status: invite.status, expiresAt: invite.expiresAt, existingUser: Boolean(existingJudge) };
};

export const registerJudgeFromInvitation = async (token, userData) => {
  const invite = await Invitation.findOne({ tokenHash: hashToken(token), type: 'judge' });
  assertActiveInvite(invite);

  if (invite.email !== userData.email.trim().toLowerCase()) {
    throw new AppError('Invitation email does not match registration email', HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
  }

  const user = await authService.registerUser({ ...userData, role: Roles.JUDGE });
  await hackathonRepository.addJudge(invite.hackathon, user._id);
  invite.status = 'accepted';
  invite.acceptedBy = user._id;
  invite.respondedAt = new Date();
  await invite.save();
  return user;
};

export const respondToJudgeInvitation = async (token, userId, accepted) => {
  const invite = await Invitation.findOne({ tokenHash: hashToken(token), type: 'judge' });
  assertActiveInvite(invite);

  const user = await User.findById(userId);
  if (!user || user.email !== invite.email) {
    throw new AppError('This invitation belongs to a different user', HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN);
  }
  if (accepted) {
    await hackathonRepository.addJudge(invite.hackathon, userId);
    await notificationService.createNotification({
      userId: invite.invitedBy,
      type: 'judge_accepted',
      title: 'Judge accepted invitation',
      message: `${user.email} accepted the judge invitation.`,
      meta: { hackathonId: invite.hackathon, judgeId: userId }
    });
    await notificationService.createNotification({
      userId,
      type: 'judge_assignment',
      title: 'Hackathon assignment confirmed',
      message: 'You have been assigned as a judge for the invited hackathon.',
      meta: { hackathonId: invite.hackathon }
    });
  }
  invite.status = accepted ? 'accepted' : 'declined';
  invite.acceptedBy = accepted ? userId : null;
  invite.respondedAt = new Date();
  await invite.save();
  return { id: invite._id, email: invite.email, status: invite.status, expiresAt: invite.expiresAt };
};

export const inviteTeamMember = async (teamId, leaderId, email) => {
  const team = await teamRepository.findById(teamId);
  if (!team || team.isDeleted) {
    throw new AppError('Team not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }
  const teamLeaderId = team.leader._id || team.leader;
  if (teamLeaderId.toString() !== leaderId.toString()) {
    throw new AppError('Access denied: Only the team leader can invite members', HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN);
  }
  if (team.members.length >= team.maxMembers) {
    throw new AppError('Team has reached its maximum size limit', HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
  }

  const hackathonId = team.hackathon._id || team.hackathon;
  const { invite, token } = await createInvite({
    type: 'team',
    email,
    hackathonId,
    teamId,
    invitedBy: leaderId
  });

  void emailService.sendInvitationLink({
    type: 'team_invitation',
    to: email,
    hackathon: team.hackathon,
    team,
    token
  });

  return { id: invite._id, email: invite.email, status: invite.status, expiresAt: invite.expiresAt };
};

export const respondToTeamInvitation = async (token, userId, accepted) => {
  const invite = await Invitation.findOne({ tokenHash: hashToken(token), type: 'team' });
  assertActiveInvite(invite);

  const user = await User.findById(userId);
  if (!user || user.email !== invite.email) {
    throw new AppError('This invitation belongs to a different user', HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN);
  }

  let team = null;
  if (accepted) {
    team = await teamService.addMember(invite.team, invite.invitedBy, userId);
    await notificationService.createNotification({
      userId: invite.invitedBy,
      type: 'invitation_accepted',
      title: 'Team invitation accepted',
      message: `${user.email} joined your team.`,
      meta: { teamId: invite.team, hackathonId: invite.hackathon }
    });
  }

  invite.status = accepted ? 'accepted' : 'declined';
  invite.acceptedBy = accepted ? userId : null;
  invite.respondedAt = new Date();
  await invite.save();
  return team || { id: invite._id, email: invite.email, status: invite.status, expiresAt: invite.expiresAt };
};

export default {
  inviteJudgeByEmail,
  registerJudgeFromInvitation,
  respondToJudgeInvitation,
  inviteTeamMember,
  respondToTeamInvitation
};
