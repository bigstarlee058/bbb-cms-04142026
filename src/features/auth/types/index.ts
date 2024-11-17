export type AuthUser = {
  id: string;
  email: string;
  name: string;
  bio: string;
  role: 'ADMIN' | 'USER';
};

export type UserResponse = {
  jwt: string;
  user: AuthUser;
};
