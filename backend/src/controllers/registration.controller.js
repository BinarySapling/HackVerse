import registrationService from '../services/registration.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';

export const registerForHackathon = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const { hackathonId } = req.params;

  const { registration, isReactivated } = await registrationService.registerForHackathon(userId, userRole, hackathonId);

  return ApiResponse.success(
    res,
    isReactivated ? HttpStatus.OK : HttpStatus.CREATED,
    "Registered for hackathon successfully",
    registration
  );
});

export const getMyRegistrations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await registrationService.getMyRegistrations(userId, req.query);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "My registrations retrieved successfully",
    result.registrations,
    result.pagination
  );
});

export const cancelRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const registration = await registrationService.cancelRegistration(id, userId);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Registration cancelled successfully",
    registration
  );
});

export default {
  registerForHackathon,
  getMyRegistrations,
  cancelRegistration
};
