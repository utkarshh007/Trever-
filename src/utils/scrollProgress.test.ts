import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScrollProgress,
  progressToPercentage,
  getTimelineStageForProgress,
  computeBackgroundSceneState,
  PRODUCT_TIMELINE_STAGES,
} from './scrollProgress';

test('calculateScrollProgress returns 0 at the top of the page', () => {
  assert.equal(calculateScrollProgress(0, 3000, 900), 0);
});

test('calculateScrollProgress returns 0.5 halfway down the scrollable document', () => {
  assert.equal(calculateScrollProgress(1000, 3000, 1000), 0.5);
});

test('calculateScrollProgress returns 1 at the bottom of the page and clamps overscroll', () => {
  assert.equal(calculateScrollProgress(2100, 3000, 900), 1);
  assert.equal(calculateScrollProgress(2500, 3000, 900), 1);
  assert.equal(calculateScrollProgress(-50, 3000, 900), 0);
});

test('calculateScrollProgress handles non-scrollable pages gracefully', () => {
  assert.equal(calculateScrollProgress(0, 800, 900), 0);
  assert.equal(calculateScrollProgress(0, 900, 900), 0);
});

test('progressToPercentage converts normalized progress to integer 0..100', () => {
  assert.equal(progressToPercentage(0), 0);
  assert.equal(progressToPercentage(0.456), 46);
  assert.equal(progressToPercentage(1), 100);
  assert.equal(progressToPercentage(1.5), 100);
  assert.equal(progressToPercentage(-0.2), 0);
});

test('getTimelineStageForProgress resolves all 6 product timeline stages across 0..1', () => {
  assert.equal(PRODUCT_TIMELINE_STAGES.length, 6);
  const start = getTimelineStageForProgress(0);
  assert.equal(start.stage.index, 0);
  assert.equal(start.localProgress, 0);

  const mid = getTimelineStageForProgress(0.45);
  assert.equal(mid.stage.index, 2);
  assert.ok(mid.localProgress > 0 && mid.localProgress < 1);

  const end = getTimelineStageForProgress(1);
  assert.equal(end.stage.index, 5);
  assert.equal(end.localProgress, 1);
});

test('computeBackgroundSceneState produces deterministic 3D scene vectors across scroll', () => {
  const s0 = computeBackgroundSceneState(0);
  const sMid = computeBackgroundSceneState(0.5);
  const sEnd = computeBackgroundSceneState(1);

  assert.equal(s0.explodeFactor, 0);
  assert.ok(sMid.explodeFactor > 0.7);
  assert.equal(sEnd.explodeFactor, 0);
  assert.equal(sMid.cameraPosition.length, 3);
  assert.notDeepEqual(s0.cubeRotation, sMid.cubeRotation);
});
