import test from 'node:test';
import assert from 'node:assert/strict';
import {
  tokenizeHeadingText,
  getStaggeredLetterTweenConfig,
  isHeadingEnteringViewport,
  isHeadingCompletelyOutOfViewport,
} from './staggeredLetterReveal';

test('tokenizeHeadingText splits words and tracks global and per-word character indices', () => {
  const result = tokenizeHeadingText('  Enterprise   Core ');
  assert.equal(result.cleanText, 'Enterprise Core');
  assert.equal(result.totalChars, 14);
  assert.equal(result.words.length, 2);
  assert.equal(result.words[0].word, 'Enterprise');
  assert.equal(result.words[0].chars.length, 10);
  assert.equal(result.words[0].chars[0].char, 'E');
  assert.equal(result.words[0].chars[0].globalCharIndex, 0);
  assert.equal(result.words[1].word, 'Core');
  assert.equal(result.words[1].chars[0].char, 'C');
  assert.equal(result.words[1].chars[0].globalCharIndex, 10);
  assert.equal(result.words[1].chars[3].globalCharIndex, 13);
});

test('tokenizeHeadingText handles empty or whitespace-only input cleanly', () => {
  const empty = tokenizeHeadingText('   ');
  assert.equal(empty.cleanText, '');
  assert.equal(empty.totalChars, 0);
  assert.equal(empty.words.length, 0);
});

test('getStaggeredLetterTweenConfig returns distinct H2 and H3 y-offsets and bounded stagger timing', () => {
  const h2Config = getStaggeredLetterTweenConfig(52, 'h2', false);
  const h3Config = getStaggeredLetterTweenConfig(15, 'h3', false);

  assert.equal(h2Config.fromOpacity, 0);
  assert.equal(h2Config.toOpacity, 1);
  assert.equal(h2Config.fromY, 14);
  assert.equal(h2Config.toY, 0);
  assert.ok(h2Config.stagger >= 0.009 && h2Config.stagger <= 0.024);
  assert.ok(h2Config.totalDuration > h2Config.duration);

  assert.equal(h3Config.fromY, 10);
  assert.equal(h3Config.toY, 0);
  assert.ok(h3Config.stagger >= 0.009 && h3Config.stagger <= 0.02);
  assert.equal(h3Config.ease, 'power3.out');
});

test('getStaggeredLetterTweenConfig respects prefers-reduced-motion', () => {
  const reduced = getStaggeredLetterTweenConfig(30, 'h2', true);
  assert.equal(reduced.fromOpacity, 1);
  assert.equal(reduced.fromY, 0);
  assert.equal(reduced.duration, 0);
  assert.equal(reduced.stagger, 0);
});

test('isHeadingEnteringViewport and isHeadingCompletelyOutOfViewport evaluate vertical and horizontal bounds', () => {
  const vw = 1440;
  const vh = 900;

  // Inside viewport
  assert.equal(
    isHeadingEnteringViewport(
      { top: 320, bottom: 380, left: 120, right: 680, width: 560, height: 60 },
      vw,
      vh
    ),
    true
  );

  // Below viewport fold
  assert.equal(
    isHeadingEnteringViewport(
      { top: 960, bottom: 1020, left: 120, right: 680, width: 560, height: 60 },
      vw,
      vh
    ),
    false
  );

  // Horizontally panned offscreen to the right (as in WorkSection pan rail before scrolling)
  assert.equal(
    isHeadingEnteringViewport(
      { top: 300, bottom: 350, left: 1520, right: 1840, width: 320, height: 50 },
      vw,
      vh
    ),
    false
  );

  assert.equal(
    isHeadingCompletelyOutOfViewport(
      { top: 1050, bottom: 1110, left: 120, right: 680, width: 560, height: 60 },
      vw,
      vh
    ),
    true
  );
});
