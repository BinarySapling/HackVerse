/**
 * @desc Standard API Response structure helper
 */
class ApiResponse {
  /**
   * @param {boolean} success - Status indication of the request
   * @param {string} message - Response message details
   * @param {object|array|null} [data=null] - Output payload data
   * @param {object|null} [meta=null] - Pagination or auxiliary metadata
   * @param {object} [extra={}] - Additional top-level fields for custom/legacy compatibility
   * @param {string|null} [requestId=null] - Correlation request ID
   */
  constructor(success, message, data = null, meta = null, extra = {}, requestId = null) {
    this.success = success;
    this.message = message;
    
    if (data !== null) {
      this.data = data;
    }
    
    if (meta !== null) {
      this.meta = meta;
    }

    if (requestId !== null) {
      this.requestId = requestId;
    }

    // Assign any extra fields to the root object (e.g., uptime, timestamp)
    Object.assign(this, extra);
  }

  /**
   * Send a successful JSON response
   */
  static success(res, statusCode, message, data = null, meta = null, extra = {}, requestId = null) {
    const correlationId = requestId || (res.req && res.req.requestId) || null;
    return res.status(statusCode).json(new ApiResponse(true, message, data, meta, extra, correlationId));
  }

  /**
   * Send an error JSON response
   */
  static error(res, statusCode, message, data = null, meta = null, extra = {}, requestId = null) {
    const correlationId = requestId || (res.req && res.req.requestId) || null;
    return res.status(statusCode).json(new ApiResponse(false, message, data, meta, extra, correlationId));
  }
}

export default ApiResponse;
