import { Circuit, CircuitsResponse, ErrorMessage, ExtraExercise, Filters, ResponseMessage, TitleFilters, TitleResponse } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchCircuits = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/circuits/admin/get`, {
      params: filters,
    })) as CircuitsResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchCircuit = async (circuitId: string) => {
  try {
    const result = (await axios.get(`/circuits/admin/get/${circuitId}`)) as Circuit;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchCircuitTitles = async (filters: TitleFilters) => {
  try {
    const result = await axios.get(`/circuits/admin/titlefilter`, { params: filters }) as TitleResponse[];
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createCircuit = async (payload: {
  title: string;
  exercises: ({ exerciseId: string; guide: string } & ExtraExercise)[];
}) => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('exercises', JSON.stringify(payload.exercises));
    const result = (await axios.post('/circuits/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-circuits');
      return 'Circuit successfully created.';
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


export const updateCircuit = async (payload: {
  circuitId: string 
  title: string;
  exercises: ({ exerciseId: string; guide: string } & ExtraExercise)[];
}) => {
  try {
    const formData = new FormData();
    formData.append('_id', payload.circuitId);
    formData.append('title', payload.title);
    formData.append('exercises', JSON.stringify(payload.exercises));
    const result = (await axios.put('/circuits/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-circuits');
      queryClient.invalidateQueries(['get-circuit', payload.circuitId]);
      return 'Circuit successfully updated.';
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

export const deleteCircuit = async (circuitId: string) => {
  try {
    const result = (await axios.delete(`/circuits/admin/${circuitId}`)) as ResponseMessage;
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
