import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => (
  <Loader2
    className={cn('animate-spin text-[var(--color-primary)]', sizeMap[size], className)}
  />
);

export const PageSpinner: React.FC = () => (
  <div className="flex h-64 items-center justify-center">
    <Spinner size="lg" />
  </div>
);
