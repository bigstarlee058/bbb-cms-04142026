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

export const updatePopupInfo = async (payload: {
  vimeo: string,
  vimeoTranslations: Record<string, string>,
  title: string,
  titleTranslations: Record<string, string>,
  description: string,
  descriptionTranslations: Record<string, string>,
}) => {
  try {
    const formData = new FormData();
    formData.append('vimeoId', payload.vimeo);
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    if (payload.vimeoTranslations) formData.append('vimeoTranslations', JSON.stringify(payload.vimeoTranslations));
    if (payload.titleTranslations) formData.append('titleTranslations', JSON.stringify(payload.titleTranslations));
    if (payload.descriptionTranslations) formData.append('descriptionTranslations', JSON.stringify(payload.descriptionTranslations));
    const updatedScreens = formData;
    const result = (await axios.put('/popupequipment', updatedScreens)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-popupequipment');
      return 'Workout Equipment PopUp successfully updated.';
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
