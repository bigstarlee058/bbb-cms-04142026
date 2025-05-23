import { Section, SectionsResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchSections = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/program-info/admin/get`, {
      params: filters,
    })) as SectionsResponse;
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
    const result = (await axios.get(`/program-info/admin/get/${sectionId}`)) as Section;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createSection = async (payload: {
  title: string;
  description: string;
  vimeoId: string
}) => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('vimeoId', payload.vimeoId);
    const result = (await axios.post('/program-info/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-sections');
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


export const updateSection = async (payload: {
  sectionId: string 
  title: string;
  description: string;
  vimeoId: string;
}) => {
  try {
    const formData = new FormData();
    formData.append('_id', payload.sectionId);
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('vimeoId', payload.vimeoId);
    const result = (await axios.put('/program-info/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-sections');
      queryClient.invalidateQueries(['get-section', payload.sectionId]);
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
    const result = (await axios.delete(`/program-info/admin/${sectionId}`)) as ResponseMessage;
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
