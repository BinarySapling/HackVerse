import submissionService from '../services/submission.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';

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

export const getJudgeSubmissions = asyncHandler(async (req, res) => {
  const result = await submissionService.getJudgeSubmissions(
    req.params.hackathonId,
    req.user.id,
    req.query
  );

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    'Assigned submissions fetched successfully',
    result.submissions,
    result.pagination
  );
});

export default {
  createSubmission,
  getMySubmission,
  updateSubmission,
  deleteSubmission,
  getOrganizerSubmissions,
  getJudgeSubmissions
};
