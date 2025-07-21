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
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('image', payload.image);
    formData.append('videoImage', payload.videoImage);
    formData.append('description', payload.description);
    formData.append('vimeoId', payload.vimeoId);
    formData.append('equipments', JSON.stringify(payload.equipments));
    formData.append('length', payload.length);
    // Post the new category data (including the image) to your backend
    const result = (await axios.post('/warmups/admin', formData)) as ResponseMessage;
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
    const formData = new FormData();
      formData.append('_id', warmupId);
      formData.append('title', payload.title);
      formData.append('image', payload.image);
      formData.append('videoImage', payload.videoImage);
      formData.append('description', payload.description);
      formData.append('vimeoId', payload.vimeoId);
      formData.append('length', payload.length);
      formData.append('equipments', JSON.stringify(payload.equipments));
      const result = (await axios.put('/warmups/admin', formData)) as ResponseMessage;
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
