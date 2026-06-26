import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { WifiOff, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ChangePasswordModal } from '../../features/auth/components/ChangePasswordModal';
import { useSSEConnection } from '../../hooks/useSSEConnection';
import { ErrorBoundary } from '../error/ErrorBoundary';
import { cn } from '../../utils/cn';

const SSEBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const status = useSSEConnection();
  const show = !dismissed && (status === 'disconnected' || status === 'error');

  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-300',
        show ? 'max-h-12' : 'max-h-0',
      )}
    >
      {show && (
        <div className="flex items-center justify-between gap-3 bg-amber-50 border-b border-amber-200 px-6 py-2.5">
          <div className="flex items-center gap-2 text-amber-800">
            <WifiOff className="h-3.5 w-3.5 flex-shrink-0" />
            <p className="text-xs font-medium">
              Live updates are currently unavailable. Data may be stale — refresh the page to reconnect.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="flex h-5 w-5 items-center justify-center rounded text-amber-700 hover:text-amber-900 transition-colors flex-shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onChangePassword={() => setPasswordModalOpen(true)} />
        <SSEBanner />

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
};
