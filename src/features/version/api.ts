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
    android: {
      version: string;
      forceUpdate: boolean;
      showPopUp: boolean;
    };
    ios: {
      version: string;
      forceUpdate: boolean;
      showPopUp: boolean;
    };
    update_title: string;
    update_titleTranslations: Record<string, string>;
    update_messageTranslations: Record<string, string>;
    update_message: string;
}) => {
  try {
    
    const jsonData = {
      androidVersion: payload.android.version,
      androidForceUpdate: payload.android.forceUpdate,
      androidShowPopUp: payload.android.showPopUp,
      iosShowPopUp: payload.ios.showPopUp,
      iosVersion: payload.ios.version,
      iosForceUpdate: payload.ios.forceUpdate,
      update_title: payload.update_title,
      update_messageTranslations:payload.update_messageTranslations,
      update_titleTranslations:payload.update_titleTranslations,
      update_message:payload.update_message,
    };
    
    const result = (await axios.put('/version', jsonData)) as ResponseMessage;
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
