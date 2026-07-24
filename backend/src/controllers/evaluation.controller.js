import evaluationService from '../services/evaluation.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';

/**
 * @desc Handle HTTP PATCH assign judge to a hackathon
 * @route PATCH /api/v1/hackathons/:hackathonId/judges/:judgeId
 * @access Protected (Organizer/Admin only)
 */
export const assignJudge = asyncHandler(async (req, res) => {
  const { hackathonId, judgeId } = req.params;
  const organizerId = req.user.id;
  const organizerRole = req.user.role;

  await evaluationService.assignJudge(organizerId, organizerRole, hackathonId, judgeId);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Judge assigned to hackathon successfully"
  );
});

/**
 * @desc Handle HTTP POST evaluate submission
 * @route POST /api/v1/submissions/:submissionId/evaluate
 * @access Protected (Judge only)
 */
export const evaluateSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const judgeId = req.user.id;
  const judgeRole = req.user.role;

  const evaluation = await evaluationService.evaluateSubmission(judgeId, judgeRole, submissionId, req.body);

  return ApiResponse.success(
    res,
    HttpStatus.CREATED,
    "Submission evaluated successfully",
    evaluation
  );
});

/**
 * @desc Handle HTTP PATCH update evaluation values
 * @route PATCH /api/v1/evaluations/:evaluationId
 * @access Protected (Judge owner only)
 */
export const updateEvaluation = asyncHandler(async (req, res) => {
  const { evaluationId } = req.params;
  const judgeId = req.user.id;

  const updatedEvaluation = await evaluationService.updateEvaluation(evaluationId, judgeId, req.body);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Evaluation updated successfully",
    updatedEvaluation
  );
});

/**
 * @desc Handle HTTP GET fetch judge's own evaluations
 * @route GET /api/v1/evaluations/me
 * @access Protected (Judge only)
 */
export const getMyEvaluations = asyncHandler(async (req, res) => {
  const judgeId = req.user.id;

  const result = await evaluationService.getMyEvaluations(judgeId, req.query);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Evaluations list fetched successfully",
    result.evaluations,
    result.pagination
  );
});

/**
 * @desc Handle HTTP GET fetch submissions scoring list for organizer
 * @route GET /api/v1/hackathons/:hackathonId/evaluations
 * @access Protected (Organizer/Admin only)
 */
export const getOrganizerEvaluations = asyncHandler(async (req, res) => {
  const { hackathonId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const result = await evaluationService.getOrganizerEvaluations(hackathonId, userId, userRole, req.query);

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    "Evaluations list fetched successfully",
    result.evaluations,
    result.pagination
  );
});

export default {
  assignJudge,
  evaluateSubmission,
  updateEvaluation,
  getMyEvaluations,
  getOrganizerEvaluations
};
