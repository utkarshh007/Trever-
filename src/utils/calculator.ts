export interface ScopeOptions {
  selectedServiceIds: string[];
  complexity: 'starter' | 'growth' | 'enterprise';
  platformTargets: string[]; // e.g. ['web', 'ios', 'android', 'cloud']
  requiresMaintenance: boolean;
  urgentTimeline: boolean;
}

export interface EstimationResult {
  estimatedWeeksMin: number;
  estimatedWeeksMax: number;
  recommendedTeam: Array<{ role: string; count: number }>;
  estimatedCostRange: string;
  complexityFactor: number;
  primaryMilestonesCount: number;
}

/**
 * Calculates project scope metrics, timeline, and team structure based on selected requirements.
 * Hardened against null, undefined, NaN, prototype pollution, and malformed arrays.
 */
export function calculateProjectScope(options?: Partial<ScopeOptions> | null): EstimationResult {
  const safeOptions = options && typeof options === 'object' ? options : {};

  // Safely extract and sanitize service IDs
  const rawServices = Array.isArray(safeOptions.selectedServiceIds)
    ? safeOptions.selectedServiceIds.filter(s => typeof s === 'string' && s.length > 0)
    : [];
  // Deduplicate service IDs to prevent duplicate counting
  const selectedServiceIds = Array.from(new Set(rawServices));
  const baseServiceCount = Math.max(1, selectedServiceIds.length);

  // Complexity multiplier
  const complexity = safeOptions.complexity;
  let complexityMultiplier = 1.0;
  if (complexity === 'growth') complexityMultiplier = 1.4;
  else if (complexity === 'enterprise') complexityMultiplier = 2.0;

  // Safely extract platform targets
  const rawPlatforms = Array.isArray(safeOptions.platformTargets)
    ? safeOptions.platformTargets.filter(p => typeof p === 'string' && p.length > 0)
    : [];
  const platformTargets = Array.from(new Set(rawPlatforms));
  const platformCount = Math.max(1, platformTargets.length);
  const platformMultiplier = 1 + (platformCount - 1) * 0.25;

  // Base weeks calculation
  const baseWeeks = baseServiceCount * 1.5 + 2; // +2 weeks initial discovery/architecture
  let rawWeeksMin = Math.round(baseWeeks * complexityMultiplier * platformMultiplier);
  let rawWeeksMax = Math.round(rawWeeksMin * 1.35);

  // If urgent timeline requested, reduce timeline by 25% but enforce minimum floor
  const urgentTimeline = Boolean(safeOptions.urgentTimeline);
  if (urgentTimeline) {
    rawWeeksMin = Math.max(2, Math.round(rawWeeksMin * 0.75));
    rawWeeksMax = Math.max(3, Math.round(rawWeeksMax * 0.75));
  }

  // Ensure finite positive numbers
  rawWeeksMin = Number.isFinite(rawWeeksMin) && rawWeeksMin > 0 ? rawWeeksMin : 2;
  rawWeeksMax = Number.isFinite(rawWeeksMax) && rawWeeksMax >= rawWeeksMin ? rawWeeksMax : rawWeeksMin + 1;

  // Recommended Team Composition
  const recommendedTeam: Array<{ role: string; count: number }> = [
    { role: 'Technical Lead & Architect', count: 1 },
    {
      role: 'Senior Software Engineers',
      count: Math.min(6, Math.max(1, Math.ceil(baseServiceCount / 3) + (complexity === 'enterprise' ? 2 : 0))),
    },
    {
      role: 'UI/UX & Product Designer',
      count: selectedServiceIds.includes('ui-ux') || baseServiceCount >= 3 ? 1 : 0,
    },
    {
      role: 'QA & Test Automation Specialist',
      count: selectedServiceIds.includes('qa-testing') || baseServiceCount >= 2 ? 1 : 0,
    },
    {
      role: 'Cloud & DevOps Engineer',
      count: selectedServiceIds.includes('cloud-devops') || baseServiceCount >= 4 ? 1 : 0,
    },
  ].filter(member => member.count > 0);

  // Estimated Cost Range Calculation
  const totalDevMonths = (rawWeeksMin / 4) * recommendedTeam.reduce((acc, member) => acc + member.count, 0);
  const requiresMaintenance = Boolean(safeOptions.requiresMaintenance);
  const baseMinCost = Math.round((totalDevMonths * 9000) / 1000) * 1000;
  const baseMaxCost = Math.round((totalDevMonths * 13000 * (requiresMaintenance ? 1.15 : 1.0)) / 1000) * 1000;

  const formatCurrency = (val: number) => {
    if (!Number.isFinite(val) || val <= 0) return '$0';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    return `$${Math.round(val / 1000)}k`;
  };

  const estimatedCostRange = `${formatCurrency(baseMinCost)} - ${formatCurrency(baseMaxCost)}`;
  const complexityFactor = Number((complexityMultiplier * platformMultiplier).toFixed(1));

  return {
    estimatedWeeksMin: rawWeeksMin,
    estimatedWeeksMax: rawWeeksMax,
    recommendedTeam,
    estimatedCostRange,
    complexityFactor: Number.isFinite(complexityFactor) ? complexityFactor : 1.0,
    primaryMilestonesCount: Math.min(8, baseServiceCount + 2),
  };
}
