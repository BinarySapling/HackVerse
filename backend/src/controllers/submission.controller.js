import submissionService from '../services/submission.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';

/**
 * @desc Handle HTTP POST create submission request
 * @route POST /api/v1/hackathons/:hackathonId/submissions
 * @access Protected (Team Leader only)
 */
export const createSubmission = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { hackathonId } = req.params;

  const submission = await submissionService.createSubmission(userId, hackathonId, req.body);

  return ApiResponse.success(
    res,
    HttpStatus.CREATED,
    "Project submitted successfully",
    submission
  );
});

/**
 * @desc Handle HTTP GET fetch logged-in team leader's submission
 * @route GET /api/v1/hackathons/:hackathonId/my-submission
 * @access Protected (Team Leader only)
 */
export const getMySubmission = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { hackathonId } = req.params;

  const submission = await submissionService.getMySubmission(userId, hackathonId);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Submission details fetched successfully",
    submission
  );
});

/**
 * @desc Handle HTTP PATCH update submission
 * @route PATCH /api/v1/submissions/:submissionId
 * @access Protected (Team Leader only)
 */
export const updateSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const userId = req.user.id;

  const updatedSubmission = await submissionService.updateSubmission(submissionId, userId, req.body);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Submission updated successfully",
    updatedSubmission
  );
});

/**
 * @desc Handle HTTP DELETE soft-delete submission
 * @route DELETE /api/v1/submissions/:submissionId
 * @access Protected (Team Leader/Admin only)
 */
export const deleteSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  await submissionService.deleteSubmission(submissionId, userId, userRole);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Submission deleted successfully"
  );
});

/**
 * @desc Handle HTTP GET fetch submissions under a hackathon for organizers
 * @route GET /api/v1/hackathons/:hackathonId/submissions
 * @access Protected (Organizer/Admin only)
 */
export const getOrganizerSubmissions = asyncHandler(async (req, res) => {
  const { hackathonId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const result = await submissionService.getOrganizerSubmissions(hackathonId, userId, userRole, req.query);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Submissions list fetched successfully",
    result.submissions,
    result.pagination
  );
});

export default {
  createSubmission,
  getMySubmission,
  updateSubmission,
  deleteSubmission,
  getOrganizerSubmissions
};
