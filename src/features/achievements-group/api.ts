import {  AchievementsGroupResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { buildFormDataWithImages } from '@/utils/formDataBuilder';
export const fetchAchievements = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/achievements-group/admin/get`, {
      params: filters,
    })) as AchievementsGroupResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createAchievement = async (payload) => {
  try {
    const formData = buildFormDataWithImages(payload, []);
    const result = (await axios.post('/achievements-group/admin', formData)) as any;
    if (result.result === true) {
      return 'Achievement successfully created.';
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

export const updateAchievement = async (payload) => {
  try {
    const formData = buildFormDataWithImages(payload, []);  
    formData.append('_id', payload.achievementId);
    const result = (await axios.put('/achievements-group/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      return 'Achievement successfully updated.';
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

export const deleteAchievement = async (achievementId: string) => {
  try {
    const result = (await axios.delete(`/achievements-group/admin/${achievementId}`)) as ResponseMessage;
    if (result.result === true) {
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
