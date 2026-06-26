import React, { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-100">
            <AlertTriangle className="h-7 w-7 text-[var(--color-destructive)]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-semibold text-[var(--color-foreground)]">
              Something went wrong
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)] max-w-sm">
              An unexpected error occurred in this part of the application.
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 h-8 px-3 rounded border border-[var(--color-border)] bg-white text-xs font-medium text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
