import React, { useMemo } from 'react';
import { tokenizeHeadingText } from '../utils/staggeredLetterReveal';

export interface StaggeredHeadingProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'children'> {
  as: 'h2' | 'h3';
  text: string;
  className?: string;
}

export default function StaggeredHeading({
  as: Tag,
  text,
  className = '',
  ...rest
}: StaggeredHeadingProps) {
  const tokenized = useMemo(() => tokenizeHeadingText(text), [text]);

  return (
    <Tag
      aria-label={tokenized.cleanText}
      data-stagger-heading="true"
      data-stagger-level={Tag}
      data-stagger-state="revealed"
      className={`text-left ${className}`}
      {...rest}
    >
      {tokenized.cleanText}
    </Tag>
  );
}

