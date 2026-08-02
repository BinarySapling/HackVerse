import path from 'path';
import fs from 'fs';
import { submissionsDir } from '../middleware/upload.js';

export const submissionFilePath = (filename) => `/uploads/submissions/${filename}`;

export const applyUploadedFiles = (body, files = {}) => {
  const payload = { ...body };
  if (files.screenshot?.[0]) {
    payload.screenshotUrl = submissionFilePath(files.screenshot[0].filename);
  }
  if (files.presentation?.[0]) {
    payload.presentationUrl = submissionFilePath(files.presentation[0].filename);
  }
  return payload;
};

export const removeSubmissionFile = (url) => {
  if (!url || !url.startsWith('/uploads/submissions/')) return;
  const filePath = path.join(submissionsDir, path.basename(url));
  fs.promises.unlink(filePath).catch(() => {});
};

export default { submissionFilePath, applyUploadedFiles, removeSubmissionFile };
