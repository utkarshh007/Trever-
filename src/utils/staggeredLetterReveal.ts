export interface StaggeredCharToken {
  char: string;
  globalCharIndex: number;
  wordCharIndex: number;
}

export interface StaggeredWordToken {
  word: string;
  wordIndex: number;
  chars: StaggeredCharToken[];
}

export interface TokenizedHeading {
  cleanText: string;
  totalChars: number;
  words: StaggeredWordToken[];
}

export interface StaggeredLetterTweenConfig {
  fromOpacity: number;
  toOpacity: number;
  fromY: number;
  toY: number;
  duration: number;
  stagger: number;
  ease: string;
  totalDuration: number;
}

export interface HeadingRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

/**
 * Splits heading text into words and individual character tokens so each character
 * can be animated independently by GSAP while preserving intact word wrapping.
 */
export function tokenizeHeadingText(rawText: string): TokenizedHeading {
  const cleanText = String(rawText ?? '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    return { cleanText: '', totalChars: 0, words: [] };
  }

  const rawWords = cleanText.split(' ');
  let globalCharIndex = 0;

  const words: StaggeredWordToken[] = rawWords.map((word, wordIndex) => {
    const glyphs = Array.from(word);
    const chars: StaggeredCharToken[] = glyphs.map((char, wordCharIndex) => {
      const token: StaggeredCharToken = {
        char,
        globalCharIndex,
        wordCharIndex,
      };
      globalCharIndex += 1;
      return token;
    });

    return {
      word,
      wordIndex,
      chars,
    };
  });

  return {
    cleanText,
    totalChars: globalCharIndex,
    words,
  };
}

/**
 * Computes deterministic GSAP staggered-letter reveal parameters for H2 and H3 headings.
 * Scales per-character stagger inversely with character count so both short H3s
 * and multi-word H2s feel crisp and responsive.
 */
export function getStaggeredLetterTweenConfig(
  charCount: number,
  level: 'h2' | 'h3',
  reducedMotion = false
): StaggeredLetterTweenConfig {
  if (reducedMotion || charCount <= 0) {
    return {
      fromOpacity: 1,
      toOpacity: 1,
      fromY: 0,
      toY: 0,
      duration: 0,
      stagger: 0,
      ease: 'none',
      totalDuration: 0,
    };
  }

  const fromY = level === 'h2' ? 14 : 10;
  const duration = level === 'h2' ? 0.52 : 0.44;
  const targetSpread = level === 'h2' ? 0.48 : 0.36;
  const minStagger = 0.009;
  const maxStagger = level === 'h2' ? 0.024 : 0.02;

  const rawStagger = targetSpread / Math.max(1, charCount);
  const clampedStagger = Math.max(minStagger, Math.min(maxStagger, rawStagger));
  const stagger = Number(clampedStagger.toFixed(4));
  const totalDuration = Number(
    (duration + Math.max(0, charCount - 1) * stagger).toFixed(3)
  );

  return {
    fromOpacity: 0,
    toOpacity: 1,
    fromY,
    toY: 0,
    duration,
    stagger,
    ease: 'power3.out',
    totalDuration,
  };
}

/**
 * Determines whether a heading's bounding box has entered the active viewport trigger zone,
 * accounting for both vertical scroll and horizontal pan rails.
 */
export function isHeadingEnteringViewport(
  rect: HeadingRect,
  viewportWidth: number,
  viewportHeight: number
): boolean {
  if (rect.width <= 0 || rect.height <= 0 || viewportWidth <= 0 || viewportHeight <= 0) {
    return false;
  }

  const verticallyVisible =
    rect.top <= viewportHeight * 0.93 && rect.bottom >= viewportHeight * 0.05;
  const horizontallyVisible =
    rect.left <= viewportWidth * 0.95 && rect.right >= viewportWidth * 0.03;

  return verticallyVisible && horizontallyVisible;
}

/**
 * Determines whether a heading has scrolled completely outside the viewport
 * so its staggered-letter state can be reset for re-entry.
 */
export function isHeadingCompletelyOutOfViewport(
  rect: HeadingRect,
  viewportWidth: number,
  viewportHeight: number
): boolean {
  if (viewportWidth <= 0 || viewportHeight <= 0) {
    return false;
  }

  return (
    rect.bottom < -viewportHeight * 0.12 ||
    rect.top > viewportHeight * 1.08 ||
    rect.right < -viewportWidth * 0.12 ||
    rect.left > viewportWidth * 1.12
  );
}
