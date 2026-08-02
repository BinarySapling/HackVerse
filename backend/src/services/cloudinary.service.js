import { v2 as cloudinary } from 'cloudinary';
import config from '../config/env.js';
import logger from '../config/logger.js';

const cloudinaryUrl = config.cloudinary.url?.trim();
const hasCloudinaryUrl = /^cloudinary:\/\//i.test(cloudinaryUrl || '');
const hasCloudinaryParts = Boolean(
  config.cloudinary.cloudName &&
    config.cloudinary.apiKey &&
    config.cloudinary.apiSecret
);

if (hasCloudinaryUrl) {
  cloudinary.config({ cloudinary_url: cloudinaryUrl });
} else if (hasCloudinaryParts) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
} else {
  logger.warn(
    'Cloudinary uploads disabled: set CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET. CLOUDINARY_API is accepted as an API-key alias only.'
  );
}

export const isCloudinaryConfigured = () => hasCloudinaryUrl || hasCloudinaryParts;

export const uploadImageBuffer = (buffer, options = {}) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${config.cloudinary.folder}/banners`,
        resource_type: 'image',
        overwrite: false,
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

export const uploadImageFile = async (filePath, options = {}) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  return cloudinary.uploader.upload(filePath, {
    folder: `${config.cloudinary.folder}/banners`,
    resource_type: 'image',
    overwrite: false,
    ...options,
  });
};

export default {
  isCloudinaryConfigured,
  uploadImageBuffer,
  uploadImageFile,
};
