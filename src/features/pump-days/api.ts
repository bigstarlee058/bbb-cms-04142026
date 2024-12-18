import { PumpDay, PumpDaysResponse, ErrorMessage, Filters, ResponseMessage, TitleFilters, TitleResponse } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchPumpDays = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/pump-days/admin/get`, {
      params: filters
    })) as PumpDaysResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    return Promise.reject(error);
  }
};

export const fetchPumpDay = async (pumpDayId: string) => {
  try {
    const result = (await axios.get(`/pump-days/admin/get/${pumpDayId}`)) as PumpDay;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    return Promise.reject(error);
  }
};

export const fetchPumpDayTitles = async (filters: TitleFilters) => {
  try {
    const result = await axios.get(`/pump-days/admin/titlefilter`, { params: filters }) as TitleResponse[];
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createPumpDay = async (payload: {
  title: string;
  description: string;
  vimeoId: string;
  circuits: { round: number; circuitId: string }[];
}) => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('vimeoId', payload.vimeoId);
    formData.append('circuits', JSON.stringify(payload.circuits));
    const result = (await axios.post('/pump-days/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-pump-days');
      return 'Section successfully created.';
    }
    return result.message;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    console.log(error);
    return Promise.reject(error);
  }
};

export const updatePumpDay = async (payload: {
  pumpDayId: string;
  title: string;
  description: string;
  vimeoId: string;
  circuits: { round: number; circuitId: string }[];
}) => {
  try {
    const formData = new FormData();
    formData.append('_id', payload.pumpDayId);
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('vimeoId', payload.vimeoId);
    formData.append('circuits', JSON.stringify(payload.circuits));
    const result = (await axios.put('/pump-days/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-pump-days');
      queryClient.invalidateQueries(['get-pump-day', payload.pumpDayId]);
      return 'Pump day successfully updated.';
    }
    return result.message;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    return Promise.reject(error);
  }
};

export const deletePumpDay = async (pumpDayId: string) => {
  try {
    const result = (await axios.delete(`/pump-days/admin/${pumpDayId}`)) as ResponseMessage;
    if (result.result === true) {
      return 'Successfully deleted.';
    }
    return Promise.reject(result.message);
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    return Promise.reject(error);
  }
};
