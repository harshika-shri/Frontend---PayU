import React from 'react';
import { cn } from '../../utils/cn';

type BrandMarkSize = 'sm' | 'md' | 'lg';

interface BrandMarkProps {
  size?: BrandMarkSize;
  showText?: boolean;
  variant?: 'default' | 'light';
  className?: string;
}

const iconSizeMap: Record<BrandMarkSize, string> = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const textSizeMap: Record<BrandMarkSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl',
};

const BrandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <rect
      x="4"
      y="3"
      width="16"
      height="18"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <path
      d="M8 9h8M8 13h8M8 17h5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 'md',
  showText = true,
  variant = 'default',
  className,
}) => (
  <div className={cn('inline-flex items-center gap-2.5', className)}>
    <BrandIcon
      className={cn(
        'flex-shrink-0',
        iconSizeMap[size],
        variant === 'light' ? 'text-white' : 'text-[var(--color-foreground)]',
      )}
    />
    {showText && (
      <span
        className={cn(
          'font-semibold tracking-tight lowercase',
          textSizeMap[size],
          variant === 'light' ? 'text-white' : 'text-[var(--color-foreground)]',
        )}
      >
        payu
      </span>
    )}
  </div>
);
