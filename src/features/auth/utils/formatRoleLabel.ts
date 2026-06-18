import { UserRole } from '../constants/userRole';

export const formatRoleLabel = (role: UserRole | string | null) => {
  switch (role) {
    case UserRole.ADMIN:
    case 'admin':
      return 'Admin';
    case UserRole.FINANCE_ASSOCIATE:
    case 'finance_associate':
      return 'Finance Associate';
    case UserRole.FINANCE_MANAGER:
    case 'finance_manager':
      return 'Finance Manager';
    default:
      return role;
  }
};
