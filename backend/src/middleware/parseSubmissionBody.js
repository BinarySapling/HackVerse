const parseSubmissionBody = (req, _res, next) => {
  if (typeof req.body.techStack === 'string') {
    const raw = req.body.techStack.trim();
    if (!raw) {
      req.body.techStack = [];
    } else {
      try {
        const parsed = JSON.parse(raw);
        req.body.techStack = Array.isArray(parsed) ? parsed : [raw];
      } catch {
        req.body.techStack = raw.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
  }

  for (const key of ['demoUrl', 'presentationUrl', 'videoUrl', 'screenshotUrl', 'projectName']) {
    if (req.body[key] === '') {
      req.body[key] = null;
    }
  }

  next();
};

export default parseSubmissionBody;
