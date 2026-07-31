import nodemailer from 'nodemailer';
import config from '../config/env.js';
import logger from '../config/logger.js';

export const isMailConfigured = () => {
  return Boolean(
    config.smtp.host &&
    config.smtp.port &&
    config.smtp.user &&
    config.smtp.pass &&
    config.mail.fromEmail
  );
};

const createTransporter = () => {
  if (!isMailConfigured()) {
    logger.warn('Email service disabled: SMTP environment variables are incomplete');
    return null;
  }

  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass
    }
  });
};

const transporter = createTransporter();

export default transporter;
