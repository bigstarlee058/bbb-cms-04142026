import { ErrorMessage, ResponseMessage, TutorialResponse,  Filters, TagsResponse } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

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

export const createTutorial = async (payload: {
  title: string;
  vimeoId: string;
  description: string;
  image?: File;  // Assuming the image comes as a File object from the client
}) => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('vimeoId', payload.vimeoId);
    formData.append('description', payload.description);
    formData.append('image', payload.image);
    // Post the new tag data (including the image) to your backend
    const result = (await axios.post('/tutorials/admin', formData)) as any;
    // Invalidate cache or update your frontend state if needed
    if (result.result === true) {
      queryClient.invalidateQueries('get-tutorials');
      return result.tutorials;
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

export const updateTutorials = async (payload : {
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

export const updateTutorial = async (payload: {
  tutorialId: string 
  title: string;
  vimeoId: string;
  description: string;
  image: File;  // Assuming the image comes as a File object from the client
  deleteImage: Boolean
}) => {
  try {
    const formData = new FormData();
    formData.append('_id', payload.tutorialId);
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('vimeoId', payload.vimeoId);
    formData.append('image', payload.image);
    formData.append('deleteImage', String(payload.deleteImage));
    const result = (await axios.put('/tutorials/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-tutorials');
      return 'Tag successfully updated.';
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
