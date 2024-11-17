import { ErrorMessage, ResponseMessage, ScreensResponse } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchTutorials = async () => {
  try {
    const result = (await axios.get(`/tutorials`)) as ScreensResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const updateTutorials = async (payload : {
  vimeo: string,
  image: File,
  deleteImage: boolean,
  description: string,
}) => {
  try {
    const formData = new FormData();
    formData.append('vimeoId', payload.vimeo);
    formData.append('description', payload.description);
    if (payload.image) {
      formData.append('image', payload.image);
    }
    const updatedScreens = formData;
    console.log('updatedScreens', updatedScreens);
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
