import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateProjectScope } from './calculator';

test('calculateProjectScope computes realistic timeline for single starter service', () => {
  const result = calculateProjectScope({
    selectedServiceIds: ['custom-software'],
    complexity: 'starter',
    platformTargets: ['web'],
    requiresMaintenance: false,
    urgentTimeline: false,
  });

  assert.ok(result.estimatedWeeksMin >= 2);
  assert.ok(result.estimatedWeeksMax > result.estimatedWeeksMin);
  assert.ok(result.recommendedTeam.length >= 1);
  assert.ok(result.estimatedCostRange.includes('$'));
});

test('calculateProjectScope increases timeline and team for complex multi-platform scope', () => {
  const simpleResult = calculateProjectScope({
    selectedServiceIds: ['custom-software'],
    complexity: 'starter',
    platformTargets: ['web'],
    requiresMaintenance: false,
    urgentTimeline: false,
  });

  const complexResult = calculateProjectScope({
    selectedServiceIds: ['custom-software', 'web-dev', 'mobile-app', 'cloud-devops', 'cybersecurity'],
    complexity: 'enterprise',
    platformTargets: ['web', 'ios', 'android', 'cloud'],
    requiresMaintenance: true,
    urgentTimeline: false,
  });

  assert.ok(complexResult.estimatedWeeksMin > simpleResult.estimatedWeeksMin);
  assert.ok(complexResult.recommendedTeam.length > simpleResult.recommendedTeam.length);
  assert.ok(complexResult.complexityFactor > simpleResult.complexityFactor);
});

test('calculateProjectScope handles urgent timeline acceleration', () => {
  const normalResult = calculateProjectScope({
    selectedServiceIds: ['custom-software', 'web-dev'],
    complexity: 'growth',
    platformTargets: ['web'],
    requiresMaintenance: false,
    urgentTimeline: false,
  });

  const urgentResult = calculateProjectScope({
    selectedServiceIds: ['custom-software', 'web-dev'],
    complexity: 'growth',
    platformTargets: ['web'],
    requiresMaintenance: false,
    urgentTimeline: true,
  });

  assert.ok(urgentResult.estimatedWeeksMin <= normalResult.estimatedWeeksMin);
});
