import hackathonService from '../services/hackathon.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';

export const createHackathon = asyncHandler(async (req, res) => {
  const organizerId = req.user.id;
  const hackathon = await hackathonService.createHackathon(organizerId, req.body);

  return ApiResponse.success(
    res,
    HttpStatus.CREATED,
    "Hackathon created successfully",
    hackathon
  );
});

export const getHackathons = asyncHandler(async (req, res) => {
  const result = await hackathonService.getHackathons(req.query);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Hackathons retrieved successfully",
    result.hackathons,
    result.pagination
  );
});

export const getHackathonBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const hackathon = await hackathonService.getHackathonBySlug(slug);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Hackathon details retrieved successfully",
    hackathon
  );
});

export const updateHackathon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const updatedHackathon = await hackathonService.updateHackathon(id, userId, userRole, req.body);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Hackathon updated successfully",
    updatedHackathon
  );
});

export const deleteHackathon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  await hackathonService.deleteHackathon(id, userId, userRole);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Hackathon deleted successfully"
  );
});

export const publishHackathon = asyncHandler(async (req, res) => {
  const hackathon = await hackathonService.publishHackathon(
    req.params.id,
    req.user.id,
    req.user.role
  );

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    'Hackathon published successfully',
    hackathon
  );
});

export const openRegistration = asyncHandler(async (req, res) => {
  const hackathon = await hackathonService.openRegistration(
    req.params.id,
    req.user.id,
    req.user.role
  );

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    'Registration opened successfully',
    hackathon
  );
});

export const closeRegistration = asyncHandler(async (req, res) => {
  const hackathon = await hackathonService.closeRegistration(
    req.params.id,
    req.user.id,
    req.user.role
  );

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    'Registration closed successfully',
    hackathon
  );
});

export default {
  createHackathon,
  getHackathons,
  getHackathonBySlug,
  updateHackathon,
  deleteHackathon,
  publishHackathon,
  openRegistration,
  closeRegistration,
};
