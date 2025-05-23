import { Section, SectionsResponse, ErrorMessage, Filters, ResponseMessage,PhasesMainInfoResponse, PhasesResponse } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

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

export const createPhases = async (payload: {
  title: string;
  description: string;
  image: File;
}) => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('image', payload.image);
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

export const updateMainInfo = async (payload: {
  title: string;
  contenttitle: string;
  description: string;
  image: File,
  deleteImage: boolean,
}) => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('contenttitle', payload.contenttitle);
    formData.append('description', payload.description);
    if (payload.image) {
      formData.append('image', payload.image);
    }

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


export const updateSection = async (payload: {
  sectionId: string 
  title: string;
  description: string;
  image: File;
  deleteImage: boolean;
}) => {
  try {
    const formData = new FormData();
    formData.append('_id', payload.sectionId);
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('image', payload.image);
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
