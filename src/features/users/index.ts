import  { User } from './types'
import { apiCall } from '@/lib/apiCall';


export const fetchMe = async (): Promise<User> => {
  try {
    const request = await apiCall();
    const { data } = await request({ url: `users/get_user`, method: 'GET' });
 
    return {
      _id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      uid: data.uid,
    }
  } catch (error: any) {
    return Promise.reject(error);
  }
};

export * from './routes';
export * from './Profile';