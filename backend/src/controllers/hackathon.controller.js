import hackathonService from '../services/hackathon.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';

/**
 * @desc Handle HTTP POST create hackathon request
 * @route POST /api/v1/hackathons
 * @access Protected (Organizer/Admin only)
 */
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

/**
 * @desc Handle HTTP GET fetch list of hackathons
 * @route GET /api/v1/hackathons
 * @access Public
 */
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

/**
 * @desc Handle HTTP GET fetch hackathon details by URL slug
 * @route GET /api/v1/hackathons/:slug
 * @access Public
 */
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

/**
 * @desc Handle HTTP PATCH update hackathon request
 * @route PATCH /api/v1/hackathons/:id
 * @access Protected (Organizer Owner/Admin only)
 */
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

/**
 * @desc Handle HTTP DELETE soft-delete hackathon request
 * @route DELETE /api/v1/hackathons/:id
 * @access Protected (Organizer Owner/Admin only)
 */
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

export default {
  createHackathon,
  getHackathons,
  getHackathonBySlug,
  updateHackathon,
  deleteHackathon
};
