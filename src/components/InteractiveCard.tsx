import React, { useRef } from 'react';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
  tiltStrength?: number;
  testId?: string;
}

export default function InteractiveCard({
  children,
  className = '',
  onClick,
  ariaLabel,
  testId,
}: InteractiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    el.style.setProperty('--spot-x', `${x}px`);
    el.style.setProperty('--spot-y', `${y}px`);
    el.style.setProperty('--spot-opacity', '1');
  };

  const handlePointerLeave = () => {
    const el = cardRef.current;
    if (el) {
      el.style.setProperty('--spot-opacity', '0');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      ref={cardRef}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      data-testid={testId}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onFocus={() => {
        const el = cardRef.current;
        if (el) {
          el.style.setProperty('--spot-x', '50%');
          el.style.setProperty('--spot-y', '50%');
          el.style.setProperty('--spot-opacity', '1');
        }
      }}
      onBlur={handlePointerLeave}
      className={`interactive-spotlight-card text-left ${className}`}
    >
      {children}
    </div>
  );
}

