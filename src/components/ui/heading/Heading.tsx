'use client';

import clsx from 'clsx';
import './Heading.css';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface HeadingProps {
  as?: HeadingTag;
  size?: HeadingSize;
  className?: string;
  children: React.ReactNode;
}

export default function Heading({
  as: Tag = 'h2',
  size = 'md',
  className,
  children,
}: HeadingProps) {
  return (
    <Tag className={clsx('heading', `heading--${size}`, className)}>
      {children}
    </Tag>
  );
}
