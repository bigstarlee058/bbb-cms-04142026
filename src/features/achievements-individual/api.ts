import { AchievementsIndividualResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchAchievements = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/achievements-individual/admin/get`, {
      params: filters,
    })) as AchievementsIndividualResponse;

    console.log(result);
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createAchievement = async (payload: {
  title: string;
  image?: File;
  target: string;
  value: string;
  description: string;  // Assuming the image comes as a File object from the client
}) => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('image', payload.image);
    formData.append('target', payload.target);
    formData.append('value', payload.value);
    formData.append('description', payload.description);
    const result = (await axios.post('/achievements-individual/admin', formData)) as any;
    // Invalidate cache or update your frontend state if needed
    if (result.result === true) {
      console.log(result);
      queryClient.invalidateQueries('get-achievements');
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

export const updateAchievement = async (payload: {
  achievementId: string 
  title: string;
  image?: File;
  target: string;
  value: string;
  description: string;
  deleteImage: Boolean
}) => {
  try {
    const formData = new FormData();
    formData.append('_id', payload.achievementId);
    formData.append('title', payload.title);
    formData.append('image', payload.image);
    formData.append('target', payload.target);
    formData.append('value', payload.value);
    formData.append('description', payload.description);
    formData.append('deleteImage', String(payload.deleteImage));
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
