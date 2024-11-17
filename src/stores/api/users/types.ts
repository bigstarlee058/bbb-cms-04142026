export const USER_ADMIN = 1;
export const USER_STUDENT = 0;

export interface User {
    name: string;
    uid: string;
    _id: string;
    email: string;
    role: number;
}

export interface UsersResponse {
    users: User[];
    count: number;
}
  