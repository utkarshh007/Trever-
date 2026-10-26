import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateProjectScope } from './calculator';

test('calculateProjectScope never throws when given null or undefined options', () => {
  assert.doesNotThrow(() => {
    const res = calculateProjectScope(null as any);
    assert.equal(typeof res.estimatedWeeksMin, 'number');
    assert.equal(res.estimatedWeeksMin > 0, true);
    assert.equal(res.recommendedTeam.length > 0, true);
  });

  assert.doesNotThrow(() => {
    const res = calculateProjectScope(undefined as any);
    assert.equal(typeof res.estimatedWeeksMax, 'number');
    assert.equal(res.estimatedWeeksMax >= res.estimatedWeeksMin, true);
  });

  assert.doesNotThrow(() => {
    const res = calculateProjectScope({} as any);
    assert.equal(res.recommendedTeam.length >= 1, true);
  });
});

test('calculateProjectScope deduplicates duplicate service IDs and platform targets', () => {
  const withDuplicates = calculateProjectScope({
    selectedServiceIds: ['custom-software', 'custom-software', 'custom-software'],
    complexity: 'starter',
    platformTargets: ['web', 'web', 'web'],
    requiresMaintenance: false,
    urgentTimeline: false,
  });

  const singleService = calculateProjectScope({
    selectedServiceIds: ['custom-software'],
    complexity: 'starter',
    platformTargets: ['web'],
    requiresMaintenance: false,
    urgentTimeline: false,
  });

  assert.equal(withDuplicates.estimatedWeeksMin, singleService.estimatedWeeksMin);
  assert.equal(withDuplicates.estimatedWeeksMax, singleService.estimatedWeeksMax);
});

test('calculateProjectScope gracefully handles unexpected complexity strings', () => {
  const maliciousComplexity = calculateProjectScope({
    selectedServiceIds: ['custom-software'],
    complexity: '__proto__' as any,
    platformTargets: ['web'],
    requiresMaintenance: false,
    urgentTimeline: false,
  });

  assert.equal(Number.isFinite(maliciousComplexity.complexityFactor), true);
  assert.equal(maliciousComplexity.complexityFactor >= 1.0, true);
  assert.equal(maliciousComplexity.estimatedWeeksMin >= 2, true);
});

test('calculateProjectScope outputs bounded, finite currency ranges even at enterprise extremes', () => {
  const enterpriseScope = calculateProjectScope({
    selectedServiceIds: [
      'custom-software',
      'web-dev',
      'mobile-app',
      'ai-ml',
      'cloud-devops',
      'cybersecurity',
      'qa-testing',
      'ui-ux',
    ],
    complexity: 'enterprise',
    platformTargets: ['web', 'ios', 'android', 'cloud'],
    requiresMaintenance: true,
    urgentTimeline: true,
  });

  assert.equal(enterpriseScope.estimatedCostRange.includes('$'), true);
  assert.equal(enterpriseScope.estimatedWeeksMin > 0, true);
  assert.equal(enterpriseScope.estimatedWeeksMax >= enterpriseScope.estimatedWeeksMin, true);
  assert.equal(enterpriseScope.recommendedTeam.some(m => m.role === 'Cloud & DevOps Engineer'), true);
  assert.equal(enterpriseScope.recommendedTeam.some(m => m.role === 'QA & Test Automation Specialist'), true);
});
