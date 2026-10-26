import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMagneticPull,
  calculateCharProximity,
  decodeLivingText,
} from './microInteractions';

test('calculateMagneticPull handles NaN, null rect, and zero-dimension boxes safely', () => {
  assert.deepEqual(calculateMagneticPull(NaN, NaN, null), { x: 0, y: 0, innerX: 0, innerY: 0 });
  assert.deepEqual(calculateMagneticPull(100, 100, { left: 0, top: 0, width: 0, height: 0 }), {
    x: 0,
    y: 0,
    innerX: 0,
    innerY: 0,
  });
  assert.deepEqual(calculateMagneticPull(Infinity, 100, { left: 10, top: 10, width: 100, height: 40 }), {
    x: 0,
    y: 0,
    innerX: 0,
    innerY: 0,
  });
});

test('calculateCharProximity returns zero intensity on NaN or non-positive radius', () => {
  assert.deepEqual(calculateCharProximity(NaN, 100, 50, 50, 100), { intensity: 0, liftY: 0, scale: 1 });
  assert.deepEqual(calculateCharProximity(100, 100, 50, 50, -20), { intensity: 0, liftY: 0, scale: 1 });
  assert.deepEqual(calculateCharProximity(100, 100, 50, 50, 0), { intensity: 0, liftY: 0, scale: 1 });
});

test('decodeLivingText safely handles non-string inputs and out-of-bounds progress', () => {
  assert.equal(decodeLivingText(null, 0.5), '');
  assert.equal(decodeLivingText(undefined, 0.5), '');
  assert.equal(decodeLivingText(12345 as any, 0.5), '');
  assert.equal(decodeLivingText('TREVER SYSTEMS', NaN), decodeLivingText('TREVER SYSTEMS', 0));
  assert.equal(decodeLivingText('TREVER SYSTEMS', 1.5), 'TREVER SYSTEMS');
  assert.equal(decodeLivingText('TREVER SYSTEMS', -0.5), decodeLivingText('TREVER SYSTEMS', 0));
});
