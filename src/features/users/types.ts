export const USER_ADMIN = 1;
export const USER_STUDENT = 0;

export interface User {
    _id: string;
    uid: string;
    email: string;
    name: string;
    role: number;
}

export interface UsersResponse {
    users: User[];
    count: number;
}
  