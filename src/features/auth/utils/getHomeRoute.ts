import { UserRole, type UserRole as UserRoleType } from '../constants/userRole';

export function getHomeRouteForRole(role: UserRoleType | null): string {
  if (role === UserRole.ADMIN) {
    return '/admin/users';
  }

  return '/dashboard';
}
