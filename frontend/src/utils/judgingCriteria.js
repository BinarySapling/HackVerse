export const DEFAULT_SCORE_FIELDS = [
  { id: 'innovationScore', label: 'Innovation' },
  { id: 'uiuxScore', label: 'UI/UX' },
  { id: 'technicalScore', label: 'Technical Complexity' },
  { id: 'presentationScore', label: 'Presentation' },
  { id: 'codeQualityScore', label: 'Code Quality' },
  { id: 'problemSolvingScore', label: 'Problem Solving' },
];

const FIELD_KEYWORDS = {
  innovationScore: ['innovation', 'creativity', 'originality'],
  uiuxScore: ['ui/ux', 'ui ux', 'user interface', 'user experience', 'interface', 'usability', 'design'],
  technicalScore: ['technical', 'complexity', 'architecture', 'engineering', 'scalability'],
  presentationScore: ['presentation', 'pitch', 'demo', 'communication'],
  codeQualityScore: ['code', 'maintainability', 'documentation'],
  problemSolvingScore: ['problem', 'functionality', 'solution', 'impact', 'feasibility'],
};

const normalize = (name) => (name || '').toLowerCase().trim();

const matchFieldId = (criteriaName, usedIds) => {
  const normalized = normalize(criteriaName);
  for (const [fieldId, keywords] of Object.entries(FIELD_KEYWORDS)) {
    if (usedIds.has(fieldId)) continue;
    if (keywords.some((kw) => normalized.includes(kw))) {
      return fieldId;
    }
  }
  if (normalized === 'ux' || normalized === 'ui') {
    if (!usedIds.has('uiuxScore')) return 'uiuxScore';
  }
  return null;
};

export const buildScoreFieldsFromCriteria = (judgingCriteria) => {
  if (!judgingCriteria?.length) {
    return DEFAULT_SCORE_FIELDS.map((field) => ({ ...field }));
  }

  const usedIds = new Set();
  const fields = [];

  for (const criterion of judgingCriteria.slice(0, 6)) {
    let fieldId = matchFieldId(criterion.criteriaName, usedIds);
    if (!fieldId) {
      const leftover = DEFAULT_SCORE_FIELDS.find((field) => !usedIds.has(field.id));
      fieldId = leftover?.id;
    }
    if (!fieldId || usedIds.has(fieldId)) continue;

    usedIds.add(fieldId);
    fields.push({
      id: fieldId,
      label: criterion.criteriaName,
      weight: criterion.weight,
      description: criterion.description,
    });
  }

  return fields.length ? fields : DEFAULT_SCORE_FIELDS.map((field) => ({ ...field }));
};

export const computeRawTotal = (scoreFields, values) =>
  scoreFields.reduce((sum, field) => sum + (Number(values[field.id]) || 0), 0);

export const computeWeightedTotal = (scoreFields, values) => {
  const weightedFields = scoreFields.filter((field) => field.weight > 0);
  if (!weightedFields.length) return null;

  const sum = weightedFields.reduce((acc, field) => {
    const score = Number(values[field.id]) || 0;
    return acc + score * (field.weight / 100);
  }, 0);

  return Math.round(sum * 10) / 10;
};

export const hasWeightedCriteria = (scoreFields) =>
  scoreFields.some((field) => field.weight > 0);
