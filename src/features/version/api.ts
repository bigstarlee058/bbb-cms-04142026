import { ErrorMessage, ResponseMessage, VersionResponse } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchVersion = async () => {
  try {
    const result = (await axios.get(`/version`)) as VersionResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const updateVersion = async (payload : {
    version: string,
    description: string,
}) => {
  try {
    const formData = new FormData();
    formData.append('version', payload.version);
    formData.append('description', payload.description);
    
    const updatedVersion = formData;
    const result = (await axios.put('/version', updatedVersion)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-version');
      return 'Version successfully updated.';
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
