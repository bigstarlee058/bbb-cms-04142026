export type AuthUser = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  bio: string;
  role: 'ADMIN' | 'USER';
};

export type UserResponse = {
  jwt: string;
  user: AuthUser;
};
