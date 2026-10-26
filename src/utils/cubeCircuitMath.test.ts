import test from 'node:test';
import assert from 'node:assert/strict';
import { getCircuitNodeLayouts, computeCubeUnfoldState } from './cubeCircuitMath';

test('getCircuitNodeLayouts returns 12 deterministic circuit layouts across 4 quadrants', () => {
  const layouts = getCircuitNodeLayouts();
  assert.equal(layouts.length, 12);
  assert.equal(layouts[0].serviceId, 'custom-software');
  assert.equal(layouts[11].serviceId, 'consulting-delivery');

  const quadrants = new Set(layouts.map(l => l.quadrant));
  assert.deepEqual(Array.from(quadrants), [0, 1, 2, 3]);
});

test('computeCubeUnfoldState starts grounded at p=0 and fully unfolds all 12 nodes by p=0.8', () => {
  const start = computeCubeUnfoldState(0, 400);
  assert.equal(start.clampedProgress, 0);
  assert.equal(start.cubeExplodePx, 0);
  assert.equal(start.traceDashOffset, 400);
  assert.equal(start.energizedNodeCount, 2);

  const mid = computeCubeUnfoldState(0.4, 400);
  assert.ok(mid.cubeExplodePx > 10);
  assert.ok(mid.traceDashOffset < 200);
  assert.ok(mid.energizedNodeCount >= 6);

  const end = computeCubeUnfoldState(0.85, 400);
  assert.equal(end.cubeExplodePx, 24);
  assert.equal(end.traceDashOffset, 0);
  assert.equal(end.energizedNodeCount, 12);
});
