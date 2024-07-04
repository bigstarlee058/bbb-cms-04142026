import { ErrorMessage, ResponseMessage, VimeoType, VimeoPayload } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchIntro = async () => {
  try {
    const result = (await axios.get(`/intros`)) as VimeoType;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const updateIntro = async (payload: VimeoPayload) => {
  try {
    const updatedIntro = {
      ...payload,
      createdAt: Date.now(),
    };
    const result = (await axios.put('/intros', updatedIntro)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-intro');
      return 'Intro video successfully updated.';
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
