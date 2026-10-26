import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { calculateMagneticPull } from '../utils/microInteractions';

interface MagneticButtonProps {
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  className?: string;
  strength?: number;
  maxDisplacement?: number;
  children: React.ReactNode;
  ariaLabel?: string;
  testId?: string;
}

export default function MagneticButton({
  href,
  type = 'button',
  onClick,
  disabled = false,
  className = '',
  strength = 0.28,
  maxDisplacement = 9,
  children,
  ariaLabel,
  testId,
}: MagneticButtonProps) {
  const outerRef = useRef<HTMLElement | null>(null);
  const innerRef = useRef<HTMLSpanElement | null>(null);
  const sheenRef = useRef<HTMLSpanElement | null>(null);

  const quickOuterX = useRef<gsap.QuickToFunc | null>(null);
  const quickOuterY = useRef<gsap.QuickToFunc | null>(null);
  const quickInnerX = useRef<gsap.QuickToFunc | null>(null);
  const quickInnerY = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    quickOuterX.current = gsap.quickTo(outer, 'x', { duration: 0.32, ease: 'power3.out' });
    quickOuterY.current = gsap.quickTo(outer, 'y', { duration: 0.32, ease: 'power3.out' });
    quickInnerX.current = gsap.quickTo(inner, 'x', { duration: 0.28, ease: 'power3.out' });
    quickInnerY.current = gsap.quickTo(inner, 'y', { duration: 0.28, ease: 'power3.out' });

    return () => {
      gsap.killTweensOf([outer, inner]);
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (disabled) return;
    const outer = outerRef.current;
    const inner = innerRef.current;
    const sheen = sheenRef.current;
    if (!outer || !inner) return;

    const rect = outer.getBoundingClientRect();
    const pull = calculateMagneticPull(e.clientX, e.clientY, rect, strength, maxDisplacement);

    outer.setAttribute('data-magnetic-offset', `${pull.x},${pull.y}`);

    if (quickOuterX.current && quickOuterY.current) {
      quickOuterX.current(pull.x);
      quickOuterY.current(pull.y);
    } else {
      gsap.set(outer, { x: pull.x, y: pull.y });
    }

    if (quickInnerX.current && quickInnerY.current) {
      quickInnerX.current(pull.innerX);
      quickInnerY.current(pull.innerY);
    }

    if (sheen) {
      const localX = Math.round(e.clientX - rect.left);
      const localY = Math.round(e.clientY - rect.top);
      sheen.style.background = `radial-gradient(90px circle at ${localX}px ${localY}px, rgba(255,255,255,0.28), transparent 70%)`;
      sheen.style.opacity = '1';
    }
  };

  const handlePointerLeave = () => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    const sheen = sheenRef.current;
    if (!outer || !inner) return;

    outer.setAttribute('data-magnetic-offset', '0,0');

    gsap.to(outer, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.55,
      ease: 'elastic.out(1, 0.45)',
      overwrite: 'auto',
    });

    gsap.to(inner, {
      x: 0,
      y: 0,
      duration: 0.45,
      ease: 'power3.out',
      overwrite: 'auto',
    });

    if (sheen) {
      sheen.style.opacity = '0';
    }
  };

  const handlePointerDown = () => {
    if (disabled || !outerRef.current) return;
    gsap.to(outerRef.current, {
      scale: 0.965,
      duration: 0.12,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const handlePointerUp = () => {
    if (disabled || !outerRef.current) return;
    gsap.to(outerRef.current, {
      scale: 1,
      duration: 0.22,
      ease: 'back.out(2)',
      overwrite: 'auto',
    });
  };

  const sharedProps = {
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onClick,
    'aria-label': ariaLabel,
    'data-testid': testId,
    'data-magnetic': 'true',
    'data-magnetic-offset': '0,0',
    className: `relative overflow-hidden select-none will-change-transform ${className}`,
  };

  const content = (
    <>
      <span
        ref={sheenRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150"
      />
      <span
        ref={innerRef}
        className="relative z-10 inline-flex items-center justify-center gap-2 will-change-transform whitespace-nowrap"
      >
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        ref={el => {
          outerRef.current = el;
        }}
        href={href}
        {...sharedProps}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={el => {
        outerRef.current = el;
      }}
      type={type}
      disabled={disabled}
      {...sharedProps}
    >
      {content}
    </button>
  );
}
