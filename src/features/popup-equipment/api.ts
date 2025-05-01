import { ErrorMessage, ResponseMessage, PopupinfoResponse } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchPopupInfo = async () => {
  try {
    const result = (await axios.get(`/popupequipment`)) as PopupinfoResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const updatePopupInfo = async (payload : {
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
    console.log('updatedScreens', updatedScreens);
    const result = (await axios.put('/popupequipment', updatedScreens)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-popupequipment');
      return 'Popup information successfully updated.';
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
