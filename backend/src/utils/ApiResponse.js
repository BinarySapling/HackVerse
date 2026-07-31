class ApiResponse {
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

    static success(res, statusCode, message, data = null, meta = null, extra = {}, requestId = null) {
    const correlationId = requestId || (res.req && res.req.requestId) || null;
    return res.status(statusCode).json(new ApiResponse(true, message, data, meta, extra, correlationId));
  }

    static error(res, statusCode, message, data = null, meta = null, extra = {}, requestId = null) {
    const correlationId = requestId || (res.req && res.req.requestId) || null;
    return res.status(statusCode).json(new ApiResponse(false, message, data, meta, extra, correlationId));
  }
}

export default ApiResponse;
