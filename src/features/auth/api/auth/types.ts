export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  id: string,
  name: string;
  email: string;
  newPassword: string;
  repeatNewPassword: string;
}