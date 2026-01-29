import { ErrorMessage, ResponseMessage, TutorialResponse, Filters, TagsResponse } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';
import { buildFormDataWithImages } from '@/utils/formDataBuilder';
export const fetchTags = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/tags/admin/get`, {
      params: filters,
    })) as TagsResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchTutorials = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/tutorials/admin/get`)) as TutorialResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createTutorial = async (payload: any) => {
  try {
    const formData = buildFormDataWithImages(payload, ['image']);

    const response = await axios.post('/tutorials/admin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.result === true) {
      queryClient.invalidateQueries('get-tutorials');
      return response.data.tutorials;
    }
    return response.data.message;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err?.message || 'Failed to create tutorial',
    };
    return Promise.reject(error);
  }
};


export const updateTutorials = async (payload: {
  vimeo: string,
  image: File,
  deleteImage: boolean,
  title: string,
  description: string,
}) => {
  try {
    const formData = new FormData();
    formData.append('vimeoId', payload.vimeo);
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    if (payload.image) {
      formData.append('image', payload.image);
    }
    const updatedScreens = formData;
    const result = (await axios.put('/tutorials', updatedScreens)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-tutorials');
      return 'tutorials successfully updated.';
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

export const updateTutorial = async (payload: any) => {
  try {
    const formData = buildFormDataWithImages(payload, ['image']);

    const response = await axios.put('/tutorials/admin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.result === true) {
      queryClient.invalidateQueries('get-tutorials');
      return 'Tutorial successfully updated.';
    }
    return response.data.message;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err?.message || 'Failed to update tutorial',
    };
    return Promise.reject(error);
  }
};
export const deleteTutorial = async (tutorialId: string) => {
  try {
    const result = (await axios.delete(`/tutorials/admin/${tutorialId}`)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-tutorials');
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
