import { ErrorMessage, User, ResponseMessage, Filters, UsersResponse, UserWorkoutHistory } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const updateProfile = async (payload) => {
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

export const fetchAllUsers = async (): Promise<User[]> => {
  try {
    const users = (await axios.get('/users/getAllUsers')) as UsersResponse;
    return users.users;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const updateUser = async ({ userId, payload }: { userId: string, payload }) => {
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

export const fetchUserWorkout = async (userId: string) => {
  try {
    const result = (await axios.get(`/users/workouts_history/${userId}`)) as UserWorkoutHistory[];
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};
export const updateUserSubscription = async ({
  userId,
  subscription,
}: {
  userId: string;
  subscription: {
    user_subscription_status: string;
    subscription_type: string;
    price: string;
    purchase_date: string | null;
    end_date: string | null;
    update_source: 'admin' | 'wp' | 'rc';
  };
}) => {
  try {
    const payload = {
      ...subscription,
      userId,
    };

    const result = (await axios.put('/users/manage_subscription', payload)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries(['get-user', userId]);
      queryClient.invalidateQueries({ queryKey: ['get-users'] });
      return 'Subscription updated successfully.';
    }

    return result.message;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err?.response?.data?.message || err.message || 'Failed to update subscription.',
    };
    return Promise.reject(error);
  }
};
export const fetchUserSubscription = async ({
  userId,
  source,
}: {
  userId: string;
  source: 'wp' | 'rc';
}) => {
  return await axios.get('/users/subscription', {
    params: { userId, source },
  });
};