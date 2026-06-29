import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { ChangePasswordModal } from '../../features/auth/components/ChangePasswordModal';
import { ErrorBoundary } from '../error/ErrorBoundary';

export const MainLayout: React.FC = () => {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[var(--color-background)]">
      <TopBar onChangePassword={() => setPasswordModalOpen(true)} />

      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-4 py-4">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
};
