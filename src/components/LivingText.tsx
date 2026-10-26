import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { calculateCharProximity, decodeLivingText } from '../utils/microInteractions';

export interface TextSegment {
  text: string;
  accent?: boolean;
}

interface LivingTextProps {
  as?: 'h1' | 'h2' | 'h3' | 'div' | 'p';
  segments: TextSegment[];
  className?: string;
}

export function LivingText({
  as: Tag = 'h2',
  segments,
  className = '',
}: LivingTextProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);

  // Flatten segments into words with accent flags
  const words: Array<{ word: string; accent: boolean }> = [];
  segments.forEach(seg => {
    const tokens = seg.text.trim().split(/\s+/);
    tokens.forEach(token => {
      if (token) words.push({ word: token, accent: Boolean(seg.accent) });
    });
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const validWords = wordRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (validWords.length === 0) return;

    // Subtle kinetic wave when entering viewport (keeps opacity=1 for zero-latency legibility)
    const triggerWave = () => {
      gsap.fromTo(
        validWords,
        { y: 7, rotateX: -12 },
        {
          y: 0,
          rotateX: 0,
          duration: 0.65,
          stagger: 0.032,
          ease: 'expo.out',
          overwrite: 'auto',
        }
      );
    };

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            triggerWave();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(container);

    // Continuous subtle breathing shimmer on accent words
    const accentEls = validWords.filter(el => el.dataset.accent === 'true');
    let shimmerTween: gsap.core.Tween | null = null;
    if (accentEls.length > 0) {
      shimmerTween = gsap.to(accentEls, {
        y: -1.5,
        duration: 2.2,
        ease: 'sine.inOut',
        stagger: 0.18,
        yoyo: true,
        repeat: -1,
      });
    }

    return () => {
      observer.disconnect();
      shimmerTween?.kill();
      gsap.killTweensOf(validWords);
    };
  }, [segments]);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const validWords = wordRefs.current.filter(Boolean) as HTMLSpanElement[];
    validWords.forEach(wordEl => {
      const rect = wordEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const { intensity, liftY, scale } = calculateCharProximity(
        e.clientX,
        e.clientY,
        cx,
        cy,
        150
      );

      wordEl.setAttribute('data-proximity', String(intensity));

      gsap.to(wordEl, {
        y: liftY,
        scale,
        duration: 0.18,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    });
  };

  const handlePointerLeave = () => {
    const validWords = wordRefs.current.filter(Boolean) as HTMLSpanElement[];
    validWords.forEach(wordEl => {
      wordEl.setAttribute('data-proximity', '0');
    });
    gsap.to(validWords, {
      y: 0,
      scale: 1,
      duration: 0.42,
      ease: 'elastic.out(1, 0.5)',
      stagger: 0.015,
      overwrite: 'auto',
    });
  };

  return (
    <Tag
      ref={(el: HTMLElement | null) => {
        containerRef.current = el;
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      data-living-text="true"
      style={{ textWrap: 'balance' }}
      className={`cursor-default ${className}`}
    >
      {words.map((item, idx) => (
        <React.Fragment key={`${item.word}-${idx}`}>
          <span
            ref={el => {
              wordRefs.current[idx] = el;
            }}
            data-living-word="true"
            data-accent={item.accent ? 'true' : 'false'}
            data-proximity="0"
            className={`inline-block origin-bottom will-change-transform transition-colors duration-150 ${
              item.accent
                ? 'text-gradient-emerald'
                : 'hover:text-emerald-200'
            }`}
          >
            {item.word}
          </span>
          {idx < words.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </Tag>
  );
}

interface LivingKickerProps {
  primaryText: string;
  secondaryText?: string;
}

export function LivingKicker({ primaryText, secondaryText }: LivingKickerProps) {
  const [displayed, setDisplayed] = useState<string>(primaryText);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const runDecode = () => {
    const state = { p: 0.15 };
    gsap.to(state, {
      p: 1,
      duration: 0.42,
      ease: 'power2.out',
      onUpdate: () => {
        setDisplayed(decodeLivingText(primaryText, state.p));
      },
      onComplete: () => {
        setDisplayed(primaryText);
      },
    });
  };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            runDecode();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [primaryText]);

  return (
    <div
      ref={rootRef}
      onPointerEnter={runDecode}
      aria-label={secondaryText ? `${primaryText} · ${secondaryText}` : primaryText}
      className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 cursor-default select-none"
    >
      <span className="tracking-wider">{displayed}</span>
      {secondaryText && (
        <>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <span className="text-slate-400">{secondaryText}</span>
        </>
      )}
    </div>
  );
}
