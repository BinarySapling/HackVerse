import registrationService from '../services/registration.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';

export const registerForHackathon = asyncHandler(async (req, res) => {
  const { registration, isReactivated } = await registrationService.registerForHackathon(
    req.user.id,
    req.user.role,
    req.params.hackathonId
  );

  return ApiResponse.success(
    res,
    isReactivated ? HttpStatus.OK : HttpStatus.CREATED,
    'Registration submitted. Waiting for organizer approval.',
    registration
  );
});

export const getMyRegistrations = asyncHandler(async (req, res) => {
  const result = await registrationService.getMyRegistrations(req.user.id, req.query);
  return ApiResponse.success(
    res,
    HttpStatus.OK,
    'My registrations retrieved successfully',
    result.registrations,
    result.pagination
  );
});

export const getHackathonRegistrations = asyncHandler(async (req, res) => {
  const registrations = await registrationService.getHackathonRegistrations(
    req.params.hackathonId,
    req.user.id,
    req.user.role
  );
  return ApiResponse.success(res, HttpStatus.OK, 'Registrations retrieved', registrations);
});

export const reviewRegistration = asyncHandler(async (req, res) => {
  const registration = await registrationService.reviewRegistration(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body.decision
  );
  return ApiResponse.success(res, HttpStatus.OK, `Registration ${req.body.decision}d`, registration);
});

export const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await registrationService.cancelRegistration(req.params.id, req.user.id);
  return ApiResponse.success(res, HttpStatus.OK, 'Registration cancelled successfully', registration);
});

export default {
  registerForHackathon,
  getMyRegistrations,
  getHackathonRegistrations,
  reviewRegistration,
  cancelRegistration,
};
