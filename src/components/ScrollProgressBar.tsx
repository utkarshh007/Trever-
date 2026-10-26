import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { calculateScrollProgress, progressToPercentage } from '../utils/scrollProgress';

declare global {
  interface Window {
    __timelines?: Record<string, gsap.core.Timeline>;
  }
}

const COMPOSITION_ID = 'trever-scroll-progress';

export default function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    const barEl = barRef.current;
    const glowEl = glowRef.current;
    if (!barEl) return;

    // Initialize deterministic paused GSAP timeline per HyperFrames skill contract
    gsap.set(barEl, { scaleX: 0, transformOrigin: '0% 50%' });
    if (glowEl) {
      gsap.set(glowEl, { opacity: 0.35 });
    }

    const tl = gsap.timeline({ paused: true });

    // Primary progress scaleX tween across normalized duration (10s virtual timeline)
    tl.to(
      barEl,
      {
        scaleX: 1,
        duration: 10,
        ease: 'none',
      },
      0
    );

    // Mid-timeline activity: subtle emerald glow breathing pulse across scroll journey
    if (glowEl) {
      tl.to(
        glowEl,
        {
          opacity: 0.85,
          duration: 2.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: 3,
        },
        0
      );
    }

    // Register paused timeline globally for deterministic playhead scrubbing
    window.__timelines = window.__timelines || {};
    window.__timelines[COMPOSITION_ID] = tl;
    timelineRef.current = tl;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateProgressFromScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const scrollHeight = doc.scrollHeight || 0;
      const clientHeight = window.innerHeight || doc.clientHeight || 0;

      const progress = calculateScrollProgress(scrollTop, scrollHeight, clientHeight);
      setPercentage(progressToPercentage(progress));

      if (prefersReducedMotion) {
        tl.progress(progress);
      } else {
        gsap.to(tl, {
          progress,
          duration: 0.18,
          ease: 'power3.out',
          overwrite: true,
        });
      }
    };

    // Perform initial sync
    updateProgressFromScroll();

    window.addEventListener('scroll', updateProgressFromScroll, { passive: true });
    window.addEventListener('resize', updateProgressFromScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateProgressFromScroll);
      window.removeEventListener('resize', updateProgressFromScroll);
      tl.kill();
      if (window.__timelines && window.__timelines[COMPOSITION_ID] === tl) {
        delete window.__timelines[COMPOSITION_ID];
      }
    };
  }, []);

  return (
    <div
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
      data-testid="scroll-progress-bar"
      data-composition-id={COMPOSITION_ID}
      data-start="0"
      data-duration="10"
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] w-full bg-slate-950/50 pointer-events-none overflow-hidden"
    >
      <div
        ref={barRef}
        data-testid="scroll-progress-fill"
        className="h-full w-full origin-left bg-gradient-to-r from-[#0f4c5c] via-[#10b981] to-[#34d399] will-change-transform"
      />
      <div
        ref={glowRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full bg-emerald-400/30 blur-[3px] pointer-events-none"
      />
    </div>
  );
}
