import { Section, ErrorMessage, Filters, ResponseMessage,PhasesMainInfoResponse, PhasesResponse } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';
import { buildFormDataWithImages } from '@/utils/formDataBuilder';

export const fetchPhasesMainInfo = async () => {
  try {
    const result = (await axios.get(`/phases/admin/maininfo`)) as PhasesMainInfoResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchSections = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/phases/admin/get`, {
      params: filters,
    })) as PhasesResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchSection = async (sectionId: string) => {
  try {
    const result = (await axios.get(`/phases/admin/get/${sectionId}`)) as Section;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createPhases = async (data: any) => {
  try {
    const formData = buildFormDataWithImages(data, []);
    const result = (await axios.post('/phases/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-phases');
      return 'Section successfully created.';
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


export const updateMainInfo = async (payload) => {
  try {
    const formData = buildFormDataWithImages(payload, ['thumbnail']);
    const result = (await axios.put('/phases/admin/maininfo', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-phasesmaininfo');
      return 'Section successfully updated.';
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


export const updateSection = async (payload: any) => {
  try {
    const formData = buildFormDataWithImages(payload, []);
    formData.append('_id', payload.sectionId);
    const result = (await axios.put('/phases/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-phases');
      return 'Section successfully updated.';
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

export const deleteSection = async (sectionId: string) => {
  try {
    const result = (await axios.delete(`/phases/admin/${sectionId}`)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-phases');
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
