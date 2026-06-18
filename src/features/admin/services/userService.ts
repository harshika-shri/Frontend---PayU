import { apiClient } from '../../../lib/axios';
import type {
  CreateUserRequest,
  UserResponse,
} from '../types/user.types';

export const userService = {
  getUsers: async (role?: string): Promise<UserResponse[]> => {
    const params = role ? { role } : {};
    const response = await apiClient.get<UserResponse[]>('/users', { params });
    return response.data;
  },

  createUser: async (payload: CreateUserRequest): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>('/users', payload);
    return response.data;
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/users/${userId}/status`, {
      is_active: isActive,
    });
    return response.data;
  },
};
