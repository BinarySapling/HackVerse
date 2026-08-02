const JSON_FIELDS = new Set(['prizes', 'judgingCriteria', 'judgeEmails', 'problemStatements', 'techStack', 'faq']);

export const buildHackathonFormData = (payload, bannerFile) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null || value === '') continue;
    if (JSON_FIELDS.has(key)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }

  if (bannerFile) {
    formData.append('banner', bannerFile);
  }

  return formData;
};
