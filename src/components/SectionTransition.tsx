import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface SectionTransitionProps {
  children: React.ReactNode;
  id?: string;
  ariaLabel?: string;
  className?: string;
}

export default function SectionTransition({
  children,
  id,
  ariaLabel,
  className = '',
}: SectionTransitionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      return;
    }

    let hasRevealed = false;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasRevealed) {
            hasRevealed = true;
            if (lineRef.current) {
              gsap.fromTo(
                lineRef.current,
                { scaleX: 0.15, opacity: 0.3 },
                { scaleX: 1, opacity: 1, duration: 0.85, ease: 'expo.out' }
              );
            }
            const items = el.querySelectorAll('.reveal-on-scroll');
            if (items.length > 0) {
              gsap.fromTo(
                items,
                { y: 18, opacity: 0.25 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.55,
                  stagger: 0.05,
                  ease: 'power3.out',
                  clearProps: 'transform,opacity',
                }
              );
            }
          }
        });
      },
      { threshold: 0.08 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={sectionRef}
      aria-label={ariaLabel}
      className={`relative z-10 py-24 lg:py-32 bg-transparent ${className}`}
    >
      {/* Animated Circuit Divider Line */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px bg-slate-800/60 overflow-hidden"
      >
        <div
          ref={lineRef}
          style={{ transformOrigin: '50% 50%' }}
          className="h-full w-full bg-gradient-to-r from-transparent via-emerald-400/55 to-transparent"
        />
      </div>
      {children}
    </section>
  );
}
