import { ErrorMessage, ResponseMessage, ScreensResponse } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchScreens = async () => {
  try {
    const result = (await axios.get(`/screens`)) as ScreensResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const updateScreens = async (payload : {
  vimeo: string,
  image: File,
  deleteImage: boolean,
  slides: {
    title: string,
    description: string
  }[]
}) => {
  try {
    const formData = new FormData();
    formData.append('vimeoId', payload.vimeo);
    formData.append('slides', JSON.stringify(payload.slides));
    if (payload.image) {
      formData.append('image', payload.image);
    }
    const updatedScreens = formData;
    const result = (await axios.put('/screens', updatedScreens)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-screens');
      return 'screens successfully updated.';
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
