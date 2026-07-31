import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';

const JSON_FIELDS = ['prizes', 'judgingCriteria', 'judgeEmails', 'problemStatements', 'techStack', 'faq'];
const NUMBER_FIELDS = ['minTeamSize', 'maxTeamSize', 'maxTeams'];

const parseHackathonMultipart = (req, _res, next) => {
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
    req.body.banner = `/uploads/banners/${req.file.filename}`;
  }

  return next();
};

export default parseHackathonMultipart;
