import { AchievementsIndividualResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';
import { buildFormDataWithImages } from '@/utils/formDataBuilder';
export const fetchAchievements = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/achievements-individual/admin/get`, {
      params: filters,
    })) as AchievementsIndividualResponse;
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
    const result = (await axios.post('/achievements-individual/admin', formData)) as any;
    if (result.result === true) {
      // return result.achievementsIndividuals;
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
    const result = (await axios.put('/achievements-individual/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-achievements');
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
    const result = (await axios.delete(`/achievements-individual/admin/${achievementId}`)) as ResponseMessage;
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
