const BLOCKED_PATTERNS = [
  /sexual content involving minors/i,
  /child sexual/i,
  /non-consensual sexual/i,
  /real person deepfake/i,
  /copy (?:exactly|identically)/i,
  /in the exact style of/i
];

function moderateProject(project) {
  const text = `${project.title || ''}\n${project.premise || ''}`;
  const matched = BLOCKED_PATTERNS.find(pattern => pattern.test(text));
  if (matched) {
    return {
      allowed: false,
      code: 'CONTENT_REVIEW_REQUIRED',
      reason: 'The request needs review before rendering because it may involve unsafe, non-consensual, or directly imitative content.'
    };
  }
  return {
    allowed: true,
    code: 'ALLOWED',
    notes: ['Keep characters original', 'Do not imitate a living artist or protected franchise exactly', 'Obtain consent before using a real person’s likeness']
  };
}

function estimateCredits({ providerId, sceneCount = 4, quality = 'concept' }) {
  const qualityMultiplier = { concept: 1, standard: 1.5, premium: 2.5, cinematic: 4 }[quality] || 1;
  const providerMultiplier = providerId === 'tryamm-local' ? 0 : providerId === 'external-image' ? 3 : 8;
  const estimatedCredits = Math.ceil(sceneCount * qualityMultiplier * providerMultiplier);
  return {
    currency: 'credits',
    estimatedCredits,
    billable: estimatedCredits > 0,
    breakdown: { sceneCount, qualityMultiplier, providerMultiplier }
  };
}

module.exports = { moderateProject, estimateCredits };
