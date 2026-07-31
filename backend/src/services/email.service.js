import transporter, { isMailConfigured } from '../utils/mailTransport.js';
import config from '../config/env.js';
import logger from '../config/logger.js';
import judgeInvitationTemplate from '../templates/judgeInvitation.template.js';
import participantConfirmationTemplate from '../templates/participantConfirmation.template.js';
import baseTemplate from '../templates/base.template.js';

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

export const sendInvitationLink = async ({
  type,
  to,
  hackathon,
  team,
  token
}) => {
  const frontendUrl = config.frontendUrl;
  const isJudgeRegistration = type === 'judge_registration';
  const path = isJudgeRegistration
    ? `/judge/register?token=${encodeURIComponent(token)}`
    : type === 'team_invitation'
      ? `/invitations/team?token=${encodeURIComponent(token)}`
      : `/invitations/judge?token=${encodeURIComponent(token)}`;
  const link = `${frontendUrl}${path}`;
  const hackathonName = hackathon?.title || 'the hackathon';
  const subjectMap = {
    judge_invitation: `Judge invitation - ${hackathonName}`,
    judge_registration: `Register as a judge - ${hackathonName}`,
    team_invitation: `Team invitation - ${team?.name || 'HackVerse team'}`
  };

  const actionLabel = isJudgeRegistration ? 'Create Judge Account' : 'Respond to Invitation';

  return sendEmail({
    type,
    to,
    subject: subjectMap[type] || 'HackVerse invitation',
    html: baseTemplate({
      greeting: 'You are invited',
      content: `
        <p style="line-height: 1.6;">You have been invited ${type === 'team_invitation' ? `to join <strong>${team?.name}</strong>` : `to judge <strong>${hackathonName}</strong>`}.</p>
        <p style="line-height: 1.6;">Use the secure link below to ${isJudgeRegistration ? 'create your judge account' : 'accept or decline'}.</p>
        <p style="font-size: 13px; color: #64748b;">This invitation expires in 72 hours.</p>
      `,
      ctaText: actionLabel,
      ctaUrl: link
    }),
    text: `You have a HackVerse invitation for ${hackathonName}. Open: ${link}`
  });
};

export const sendSubmissionSuccess = async ({ participant, hackathon, team }) => {
  const name = getDisplayName(participant);
  const hackathonName = hackathon?.title || 'the hackathon';
  return sendEmail({
    type: 'submission_success',
    to: participant?.email,
    subject: `Submission received - ${hackathonName}`,
    html: baseTemplate({
      greeting: `Great work, ${name}!`,
      content: `
        <p>Your team <strong>${team?.name || ''}</strong> successfully submitted a project for <strong>${hackathonName}</strong>.</p>
        <p>You can update the submission until the deadline closes.</p>
      `
    }),
    text: `Submission received for ${hackathonName}.`
  });
};

export const sendWinnerAnnouncement = async ({ participant, hackathon, rank, score, teamName }) => {
  const name = getDisplayName(participant);
  const hackathonName = hackathon?.title || 'the hackathon';
  return sendEmail({
    type: 'winner_announcement',
    to: participant?.email,
    subject: `Congratulations! Rank #${rank} - ${hackathonName}`,
    html: baseTemplate({
      greeting: `Congratulations, ${name}!`,
      content: `
        <p>Your team <strong>${teamName}</strong> placed <strong>#${rank}</strong> in <strong>${hackathonName}</strong>.</p>
        <p>Final score: <strong>${score}</strong></p>
        <p>Certificate information will be available in a future update.</p>
      `
    }),
    text: `Congratulations! Team ${teamName} ranked #${rank} in ${hackathonName} with score ${score}.`
  });
};

export default {
  sendEmail,
  sendJudgeInvitation,
  sendParticipantConfirmation,
  sendInvitationLink,
  sendSubmissionSuccess,
  sendWinnerAnnouncement
};
