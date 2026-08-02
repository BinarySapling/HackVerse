import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import cloudinaryService from '../services/cloudinary.service.js';

const JSON_FIELDS = ['prizes', 'judgingCriteria', 'judgeEmails', 'problemStatements', 'techStack', 'faq'];
const NUMBER_FIELDS = ['minTeamSize', 'maxTeamSize', 'maxTeams'];

const parseHackathonMultipart = async (req, _res, next) => {
  if (!req.is('multipart/form-data')) {
    return next();
  }

  for (const field of JSON_FIELDS) {
    const value = req.body[field];
    if (typeof value === 'string' && value.trim()) {
      try {
        req.body[field] = JSON.parse(value);
      } catch {
        return next(
          new AppError(
            `Invalid JSON for field "${field}"`,
            HttpStatus.BAD_REQUEST,
            ErrorCodes.VALIDATION_ERROR
          )
        );
      }
    }
  }

  for (const field of NUMBER_FIELDS) {
    if (req.body[field] !== undefined && req.body[field] !== '') {
      req.body[field] = Number(req.body[field]);
    }
  }

  if (req.file) {
    try {
      const uploadResult = await cloudinaryService.uploadImageBuffer(req.file.buffer, {
        public_id: `hackathon-${req.user?.id || 'organizer'}-${Date.now()}`,
      });
      req.body.banner = uploadResult.secure_url;
    } catch (error) {
      return next(
        new AppError(
          `Could not upload banner to Cloudinary: ${error.message}`,
          HttpStatus.SERVICE_UNAVAILABLE,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  return next();
};

export default parseHackathonMultipart;
