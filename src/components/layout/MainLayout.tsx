import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { UserRole } from '../../features/auth/constants/userRole';
import { formatRoleLabel } from '../../features/auth/utils/formatRoleLabel';
import { LayoutDashboard, Users, LogOut, Settings, User, FileText, Mail } from 'lucide-react';
import { ChangePasswordModal } from '../../features/auth/components/ChangePasswordModal';

export const MainLayout: React.FC = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
        <div className="h-16 flex items-center px-6 bg-slate-950/50">
          <h1 className="text-xl font-bold text-white tracking-tight">PayU</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-white'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>

          {role === UserRole.ADMIN && (
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-white'
                }`
              }
            >
              <Users className="w-5 h-5" />
              User Management
            </NavLink>
          )}

          {(role === UserRole.FINANCE_ASSOCIATE || role === UserRole.FINANCE_MANAGER) && (
            <NavLink
              to="/purchase-orders"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-white'
                }`
              }
            >
              <FileText className="w-5 h-5" />
              Upload POs
            </NavLink>
          )}

          {role === UserRole.FINANCE_MANAGER && (
            <NavLink
              to="/mail-monitoring"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-white'
                }`
              }
            >
              <Mail className="w-5 h-5" />
              Mail Monitoring
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="px-3 py-2 mb-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-white">{formatRoleLabel(role)}</p>
            </div>
          </div>

          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Change Password
          </button>

          <button
            onClick={handleLogout}
            className="w-full mt-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-destructive hover:bg-slate-800/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Invoice Processing System</h2>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};
