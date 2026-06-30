import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { ApiUserRole } from '../../auth/constants/userRole';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { PageSpinner } from '../../../components/ui/Spinner';
import { UserList } from '../components/UserList';
import { CreateUserModal } from '../components/CreateUserModal';
import { userService } from '../services/userService';
import type { UserResponse } from '../types/user.types';

const ROLE_FILTER_OPTIONS = [
  { value: 'all', label: 'All finance users' },
  { value: ApiUserRole.FINANCE_ASSOCIATE, label: 'Finance Associate' },
  { value: ApiUserRole.FINANCE_MANAGER, label: 'Finance Manager' },
];

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUsers(
        roleFilter === 'all' ? undefined : roleFilter,
      );
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
    <div>
      <PageHeader
        title="User Management"
        description="Manage finance associates and finance managers for your company."
        actions={(
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Select
              className="w-full sm:w-52"
              options={ROLE_FILTER_OPTIONS}
              value={roleFilter}
              onValueChange={setRoleFilter}
              placeholder="Filter by role"
            />
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Onboard User
            </Button>
          </div>
        )}
      />

      {isLoading ? (
        <PageSpinner />
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
