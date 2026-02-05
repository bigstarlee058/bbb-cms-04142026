import { Restday, ErrorMessage, ResponseMessage, Filters, RestdaysResponse } from '@/types';
import { axios } from '@/lib/axios';
import { buildFormDataWithImages } from '@/utils/formDataBuilder';
export const fetchRestdays = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/restdays/admin/get`, { params: filters })) as RestdaysResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchRestday = async (restdayId: string) => {
  try {
    const result = (await axios.get(`/restdays/admin/get/${restdayId}`)) as Restday;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createRestday = async (payload) => {
  try {
    const formData = buildFormDataWithImages(payload, []);
    const result = (await axios.post('/restdays/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      return 'Restday successfully created.';
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

export const updateRestday = async ({ restdayId, payload }) => {
  try {
    const updatedRestday = {
      ...payload,
      _id: restdayId,
      createdAt: Date.now(),
    };
    const result = (await axios.put('/restdays/admin', updatedRestday)) as ResponseMessage;
    if (result.result === true) {
      return 'Restday successfully updated.';
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

export const deleteRestday = async (restdayId: string) => {
  try {
    const result = (await axios.delete(`/restdays/admin/${restdayId}`)) as ResponseMessage;
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
