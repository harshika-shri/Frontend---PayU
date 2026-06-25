import React from 'react';
import { cn } from '../../utils/cn';
import { AlertTriangle, WifiOff, ShieldOff, Ban, HelpCircle } from 'lucide-react';
import { Button } from './Button';

type ErrorKind = 'generic' | 'network' | 'unauthorized' | 'forbidden' | 'notFound';

interface ErrorStateProps {
  kind?: ErrorKind;
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

const errorConfig: Record<ErrorKind, { icon: React.ReactNode; title: string; description: string }> = {
  generic: {
    icon: <AlertTriangle className="h-6 w-6 text-[var(--color-destructive)]" />,
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
  },
  network: {
    icon: <WifiOff className="h-6 w-6 text-[var(--color-muted-foreground)]" />,
    title: 'Connection failed',
    description: 'Unable to connect to the server. Check your network and try again.',
  },
  unauthorized: {
    icon: <ShieldOff className="h-6 w-6 text-[var(--color-warning)]" />,
    title: 'Session expired',
    description: 'Your session has expired. Please sign in again.',
  },
  forbidden: {
    icon: <Ban className="h-6 w-6 text-[var(--color-destructive)]" />,
    title: 'Access denied',
    description: "You don't have permission to access this resource.",
  },
  notFound: {
    icon: <HelpCircle className="h-6 w-6 text-[var(--color-muted-foreground)]" />,
    title: 'Not found',
    description: 'The resource you were looking for could not be found.',
  },
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  kind = 'generic',
  title,
  description,
  onRetry,
  className,
}) => {
  const config = errorConfig[kind];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-destructive-muted)]">
        {config.icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-[var(--color-foreground)]">
          {title || config.title}
        </p>
        <p className="text-sm text-[var(--color-muted-foreground)] max-w-xs">
          {description || config.description}
        </p>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-1">
          Try again
        </Button>
      )}
    </div>
  );
};
