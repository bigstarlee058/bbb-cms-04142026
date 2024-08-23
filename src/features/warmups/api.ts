import { Warmup, WarmupsResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchWarmups = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/warmups/admin/get`, { params: filters })) as WarmupsResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchWarmup = async (warmupId: string) => {
  try {
    const result = (await axios.get(`/warmups/admin/get/${warmupId}`)) as Warmup;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createWarmup = async (payload) => {
  try {
    const newWarmup = {
      ...payload,
      createdAt: Date.now(),
    };
    const result = (await axios.post('/warmups/admin', newWarmup)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-warmups');
      return 'Warmup successfully created.';
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

export const updateWarmup = async ({ warmupId, payload }) => {
  try {
    const updatedWarmup = {
      ...payload,
      _id: warmupId,
      updatedAt: Date.now(),
    };
    const result = (await axios.put('/warmups/admin', updatedWarmup)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-warmups');
      queryClient.invalidateQueries(['get-warmup', warmupId]);
      return 'Warmup successfully updated.';
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

export const deleteWarmup = async (warmupId: string) => {
  try {
    const result = (await axios.delete(`/warmups/admin/${warmupId}`)) as ResponseMessage;
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
