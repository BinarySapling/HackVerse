/**
 * @desc Reusable wrapper for async Express route handlers to forward promise rejections to next()
 * @param {Function} fn - The asynchronous handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
