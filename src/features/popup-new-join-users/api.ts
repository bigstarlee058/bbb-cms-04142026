import { ErrorMessage, NewJoinPopupResponse } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';
import { buildFormDataWithImages } from '@/utils/formDataBuilder';
export const fetchPopupNewJoin = async () => {
  try {
    const result = (await axios.get(`/popup-new-join`)) as NewJoinPopupResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const updatePopupNewJoin = async (payload: any) => {
  try {
    const formData = buildFormDataWithImages(payload, ['imgUrl']);
    const { data } = await axios.put('/popup-new-join', formData);
console.log("formData",formData)
    if (data.result === true) {
      queryClient.invalidateQueries('get-popupnewjoin');
      return 'Popup information successfully updated.';
    }
    
    return data.message;
  } catch (error) {
    console.error(error);
    throw error;
  }
};