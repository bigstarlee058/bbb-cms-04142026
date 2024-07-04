import { axios } from '@/lib/axios';

import { UserResponse } from '../types';

export type RegisterCredentialsDTO = {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
};

export const registerWithEmailAndPassword = (
  data: RegisterCredentialsDTO
): Promise<UserResponse> => {
  return axios.post('/auth/register', data);
};
