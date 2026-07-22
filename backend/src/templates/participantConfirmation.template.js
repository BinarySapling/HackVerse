import baseTemplate from './base.template.js';

const formatDate = (value) => {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

export const participantConfirmationTemplate = ({
  participantName,
  hackathonName,
  registrationStart,
  registrationEnd
}) => {
  return baseTemplate({
    greeting: `Hello ${participantName},`,
    content: `
      <p style="margin: 0 0 14px;">Your registration for <strong>${hackathonName}</strong> is confirmed.</p>
      <p style="margin: 0 0 14px;">Registration window:</p>
      <ul style="margin: 0 0 14px; padding-left: 18px;">
        <li><strong>Starts:</strong> ${formatDate(registrationStart)}</li>
        <li><strong>Ends:</strong> ${formatDate(registrationEnd)}</li>
      </ul>
      <p style="margin: 0;">Best wishes from the HackVerse team. Build something great.</p>
    `
  });
};

export default participantConfirmationTemplate;
