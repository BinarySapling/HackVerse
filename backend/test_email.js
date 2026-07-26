import assert from 'node:assert/strict';
import config from './src/config/env.js';
import emailService from './src/services/email.service.js';
import { isMailConfigured } from './src/utils/mailTransport.js';
import judgeInvitationTemplate from './src/templates/judgeInvitation.template.js';
import participantConfirmationTemplate from './src/templates/participantConfirmation.template.js';

assert.equal(typeof config.smtp, 'object', 'SMTP config object should be available');
assert.equal(typeof config.smtp.secure, 'boolean', 'SMTP secure flag should load as a boolean');
assert.equal(config.mail.fromName || 'HackVerse', 'HackVerse', 'Default sender name should be HackVerse');

const judgeHtml = judgeInvitationTemplate({
  judgeName: 'Ada Judge',
  hackathonName: 'HackVerse Demo',
  organizerName: 'Olivia Organizer'
});

assert.ok(judgeHtml.includes('HackVerse'), 'Judge email should include application name');
assert.ok(judgeHtml.includes('Ada Judge'), 'Judge email should include judge name');
assert.ok(judgeHtml.includes('HackVerse Demo'), 'Judge email should include hackathon name');
assert.ok(judgeHtml.includes('Olivia Organizer'), 'Judge email should include organizer name');
assert.ok(judgeHtml.includes('#0F766E'), 'Judge email should use the primary color');

const participantHtml = participantConfirmationTemplate({
  participantName: 'Pat Participant',
  hackathonName: 'HackVerse Demo',
  registrationStart: '2026-07-01T10:00:00.000Z',
  registrationEnd: '2026-07-05T10:00:00.000Z'
});

assert.ok(participantHtml.includes('Pat Participant'), 'Participant email should include participant name');
assert.ok(participantHtml.includes('Registration window'), 'Participant email should include registration dates section');
assert.ok(participantHtml.includes('HackVerse Demo'), 'Participant email should include hackathon name');

const missingRecipientResult = await emailService.sendEmail({
  type: 'test_missing_recipient',
  subject: 'Test Email',
  html: '<p>Test</p>'
});
assert.equal(missingRecipientResult.skipped, true, 'Missing recipient should be skipped, not thrown');

if (!isMailConfigured()) {
  const missingSmtpResult = await emailService.sendEmail({
    type: 'test_missing_smtp',
    to: 'test@example.com',
    subject: 'Test Email',
    html: '<p>Test</p>'
  });
  assert.equal(missingSmtpResult.skipped, true, 'Missing SMTP config should be skipped, not thrown');
}

console.log('Email verification passed.');
console.log("Sample Judge Subject: You've been assigned as a Judge - HackVerse");
console.log('Sample Participant Subject: Registration Confirmed - HackVerse');
console.log('Mail configured:', isMailConfigured());
