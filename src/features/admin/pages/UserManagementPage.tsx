import React, { useEffect, useState } from 'react';
import { ApiUserRole } from '../../auth/constants/userRole';
import { UserList } from '../components/UserList';
import { CreateUserModal } from '../components/CreateUserModal';
import { userService } from '../services/userService';
import type { UserResponse } from '../types/user.types';
import { Plus, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUsers(roleFilter || undefined);
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await userService.updateUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      setUsers(users.map((user) => (
        user.id === userId ? { ...user, is_active: !currentStatus } : user
      )));
    } catch {
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-slate-500" />
            User Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage finance associates and finance managers for your company.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">All Finance Users</option>
            <option value={ApiUserRole.FINANCE_ASSOCIATE}>Finance Associate (FA)</option>
            <option value={ApiUserRole.FINANCE_MANAGER}>Finance Manager (FM)</option>
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 border border-transparent rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Onboard User
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center text-slate-400">Loading users...</div>
      ) : (
        <UserList users={users} onToggleStatus={handleToggleStatus} />
      )}

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={fetchUsers}
      />
    </div>
  );
};
