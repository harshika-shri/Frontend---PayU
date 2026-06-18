export const UserRole = {
  ADMIN: 'ADMIN',
  FINANCE_ASSOCIATE: 'FINANCE_ASSOCIATE',
  FINANCE_MANAGER: 'FINANCE_MANAGER',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const ApiUserRole = {
  ADMIN: 'admin',
  FINANCE_ASSOCIATE: 'finance_associate',
  FINANCE_MANAGER: 'finance_manager',
} as const;

export const normalizeRole = (role: string): UserRole => {
  const normalizedRole = role.trim().toLowerCase();

  if (normalizedRole === ApiUserRole.ADMIN) {
    return UserRole.ADMIN;
  }

  if (normalizedRole === ApiUserRole.FINANCE_ASSOCIATE) {
    return UserRole.FINANCE_ASSOCIATE;
  }

  if (normalizedRole === ApiUserRole.FINANCE_MANAGER) {
    return UserRole.FINANCE_MANAGER;
  }

  throw new Error('Invalid role in token');
};
