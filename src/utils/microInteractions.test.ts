import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMagneticPull,
  calculateCharProximity,
  decodeLivingText,
} from './microInteractions';

test('calculateMagneticPull returns 0 offset when cursor is at button center', () => {
  const rect = { left: 100, top: 100, width: 200, height: 60 };
  const result = calculateMagneticPull(200, 130, rect);
  assert.deepEqual(result, { x: 0, y: 0, innerX: 0, innerY: 0 });
});

test('calculateMagneticPull pulls towards cursor and clamps at maxDisplacement', () => {
  const rect = { left: 100, top: 100, width: 200, height: 60 };
  // Cursor 30px right, 10px down from center (200, 130)
  const near = calculateMagneticPull(230, 140, rect, 0.35, 14);
  assert.ok(near.x > 0 && near.x <= 14);
  assert.ok(near.y > 0 && near.y <= 10.5);
  assert.ok(Math.abs(near.innerX) < Math.abs(near.x));

  // Far cursor clamps at maxDisplacement
  const far = calculateMagneticPull(500, 500, rect, 0.35, 14);
  assert.equal(far.x, 14);
  assert.equal(far.y, 10.5);
});

test('calculateCharProximity computes cosine falloff lift within radius and 0 outside', () => {
  const directHit = calculateCharProximity(100, 100, 100, 100, 120);
  assert.equal(directHit.intensity, 1);
  assert.equal(directHit.liftY, -4.5);
  assert.ok(directHit.scale > 1);

  const midHit = calculateCharProximity(160, 100, 100, 100, 120);
  assert.equal(midHit.intensity, 0.5);
  assert.ok(midHit.liftY < 0);

  const outside = calculateCharProximity(300, 300, 100, 100, 120);
  assert.equal(outside.intensity, 0);
  assert.equal(outside.liftY, 0);
  assert.equal(outside.scale, 1);
});

test('decodeLivingText preserves spaces and converges to exact target text at progress=1', () => {
  const target = '01 · CORE CAPABILITIES';
  const start = decodeLivingText(target, 0);
  assert.equal(start.length, target.length);
  assert.notEqual(start, target);

  const half = decodeLivingText(target, 0.5);
  assert.ok(half.startsWith('01 · CORE '));

  const done = decodeLivingText(target, 1);
  assert.equal(done, target);
});
