import transporter, { isMailConfigured } from '../utils/mailTransport.js';
import config from '../config/env.js';
import logger from '../config/logger.js';
import judgeInvitationTemplate from '../templates/judgeInvitation.template.js';
import participantConfirmationTemplate from '../templates/participantConfirmation.template.js';

const getDisplayName = (user) => {
  const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  return name || user?.email || 'there';
};

const logEmail = ({ type, to, status, reason }) => {
  logger.info('Email event', {
    type,
    recipient: to,
    status,
    timestamp: new Date().toISOString(),
    reason
  });
};

export const sendEmail = async ({
  type = 'generic',
  to,
  subject,
  html,
  text
}) => {
  if (!to) {
    logEmail({ type, to, status: 'skipped', reason: 'Missing recipient' });
    return { skipped: true, reason: 'Missing recipient' };
  }

  if (!isMailConfigured() || !transporter) {
    logEmail({ type, to, status: 'skipped', reason: 'SMTP configuration incomplete' });
    return { skipped: true, reason: 'SMTP configuration incomplete' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${config.mail.fromName}" <${config.mail.fromEmail}>`,
      to,
      subject,
      html,
      text
    });

    logEmail({ type, to, status: 'sent' });
    return info;
  } catch (error) {
    logEmail({ type, to, status: 'failed', reason: error.message });
    return { failed: true, reason: error.message };
  }
};

export const sendJudgeInvitation = async ({
  judge,
  hackathon,
  organizer
}) => {
  const judgeName = getDisplayName(judge);
  const hackathonName = hackathon?.title || 'the hackathon';
  const organizerName = getDisplayName(organizer);

  return sendEmail({
    type: 'judge_invitation',
    to: judge?.email,
    subject: "You've been assigned as a Judge - HackVerse",
    html: judgeInvitationTemplate({
      judgeName,
      hackathonName,
      organizerName
    }),
    text: `Hello ${judgeName}, you have been assigned as a judge for ${hackathonName} by ${organizerName}.`
  });
};

export const sendParticipantConfirmation = async ({
  participant,
  hackathon
}) => {
  const participantName = getDisplayName(participant);
  const hackathonName = hackathon?.title || 'the hackathon';

  return sendEmail({
    type: 'participant_registration_confirmation',
    to: participant?.email,
    subject: 'Registration Confirmed - HackVerse',
    html: participantConfirmationTemplate({
      participantName,
      hackathonName,
      registrationStart: hackathon?.registrationStart,
      registrationEnd: hackathon?.registrationEnd
    }),
    text: `Hello ${participantName}, your registration for ${hackathonName} is confirmed.`
  });
};

export default {
  sendEmail,
  sendJudgeInvitation,
  sendParticipantConfirmation
};
