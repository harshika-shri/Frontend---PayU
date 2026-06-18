export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string;
  role: string;
}

export interface UpdateUserStatusRequest {
  is_active: boolean;
}
