import config from '../config/env.js';

const appName = 'HackVerse';

export const baseTemplate = ({
  greeting = 'Hello,',
  content = '',
  ctaText,
  ctaUrl
}) => {
  const ctaMarkup = ctaText && ctaUrl
    ? `
      <div style="margin-top: 24px;">
        <a href="${ctaUrl}" style="display: inline-block; background: #0F766E; color: #FFFFFF; text-decoration: none; padding: 12px 18px; border-radius: 6px; font-weight: 600;">
          ${ctaText}
        </a>
      </div>
    `
    : '';

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${appName}</title>
      </head>
      <body style="margin: 0; padding: 0; background: #F8FAFC; color: #1E293B; font-family: Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #F8FAFC; padding: 24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background: #1E293B; padding: 20px 24px;">
                    <div style="color: #FFFFFF; font-size: 20px; font-weight: 700;">${appName}</div>
                    <div style="color: #0F766E; font-size: 13px; margin-top: 4px; font-weight: 600;">Hackathon Management Platform</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 28px 24px;">
                    <h1 style="margin: 0 0 16px; color: #0B4F6C; font-size: 22px; line-height: 1.3;">${greeting}</h1>
                    <div style="font-size: 15px; line-height: 1.7; color: #334155;">
                      ${content}
                    </div>
                    ${ctaMarkup}
                  </td>
                </tr>
                <tr>
                  <td style="border-top: 1px solid #E2E8F0; padding: 16px 24px; color: #64748B; font-size: 12px; line-height: 1.6;">
                    <div>This is an automated email from ${appName}.</div>
                    <div>Need help? Contact ${config.mail.supportEmail}.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

export default baseTemplate;
