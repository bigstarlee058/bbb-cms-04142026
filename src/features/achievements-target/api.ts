import { TargetsResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchTargets = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/achievements-target/admin/get`, {
      params: filters,
    })) as TargetsResponse;
    console.log("result:::", result);
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createTarget = async (payload: {
  title: string;
}) => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    // Post the new target data (including the image) to your backend
    const result = (await axios.post('/achievements-target/admin', formData)) as any;
    // Invalidate cache or update your frontend state if needed
    if (result.result === true) {
      console.log(result);
      queryClient.invalidateQueries('get-targets');
      return result.achievementsTargets;
    }
    return result.message;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    console.log(error);
    return Promise.reject(error);
  }
};

export const updateTarget = async (payload: {
  targetId: string 
  title: string;
}) => {
  try {
    const formData = new FormData();
    formData.append('_id', payload.targetId);
    formData.append('title', payload.title);
    const result = (await axios.put('/achievements-target/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-targets');
      return 'Target successfully updated.';
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

export const deleteTarget = async (targetId: string) => {
  try {
    const result = (await axios.delete(`/achievements-target/admin/${targetId}`)) as ResponseMessage;
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
