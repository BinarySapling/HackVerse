import baseTemplate from './base.template.js';

export const judgeInvitationTemplate = ({
  judgeName,
  hackathonName,
  organizerName
}) => {
  return baseTemplate({
    greeting: `Hello ${judgeName},`,
    content: `
      <p style="margin: 0 0 14px;">You have been assigned as a judge for <strong>${hackathonName}</strong> on HackVerse.</p>
      <p style="margin: 0 0 14px;"><strong>${organizerName}</strong> has added you to the judging panel for this hackathon.</p>
      <p style="margin: 0;">Please be ready to review assigned submissions and provide fair evaluations when judging begins.</p>
    `
  });
};

export default judgeInvitationTemplate;
