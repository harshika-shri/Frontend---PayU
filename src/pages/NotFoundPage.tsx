import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-muted)]">
      <div className="flex flex-col items-center gap-5 text-center max-w-sm px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white border border-[var(--color-border)] shadow-sm">
          <FileQuestion className="h-8 w-8 text-[var(--color-muted-foreground)]" />
        </div>
        <div className="space-y-1.5">
          <p className="text-4xl font-bold text-[var(--color-foreground)] tabular-nums">404</p>
          <h1 className="text-base font-semibold text-[var(--color-foreground)]">Page not found</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Go back
        </Button>
      </div>
    </div>
  );
};
