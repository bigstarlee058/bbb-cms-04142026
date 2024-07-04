import { ErrorMessage, User, UserPayload, ResponseMessage, Filters, UsersResponse } from '@/types';
import { db_firestore, storage } from '@/utils/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const updateProfile = async (payload: UserPayload) => {
  try {
    const updatedProfile = {
      ...payload,
      updatedAt: Date.now(),
    };
    const result = (await axios.put('/users/me', updatedProfile)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('auth');
      return 'Profile successfully updated.';
    }
    return result.message;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchUsers = async (filters: Filters): Promise<UsersResponse> => {
  try {
    const users = (await axios.get('/users/admin', { params: filters })) as UsersResponse;
    return users;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const updateUser = async ({ userId, payload }: { userId: string; payload: UserPayload }) => {
  try {
    const updatedUser = {
      ...payload,
      _id: userId,
      updatedAt: Date.now(),
    };
    const result = (await axios.put('/users/admin', updatedUser)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries(['get-user', userId]);
      return 'User successfully updated.';
    }
    return result.message;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const result = (await axios.delete(`/users/admin/${userId}`)) as ResponseMessage;
    if (result.result === true) {
      return 'Successfully deleted.';
    }
    return Promise.reject(result.message);
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchUser = async (userId: string) => {
  try {
    const result = (await axios.get(`/users/admin/${userId}`)) as User;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};
