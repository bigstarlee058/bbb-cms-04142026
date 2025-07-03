import { Achievement, AchievementsGroupResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

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

export const createAchievement = async (payload: {
  title: string;
  type: string;
  description: string;
  image: File;
  achievements: Achievement[];  // Assuming the image comes as a File object from the client
}) => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('type', payload.type);
    formData.append('description', payload.description);
    formData.append('image', payload.image);
    formData.append('achievements', JSON.stringify(payload.achievements));

    const result = (await axios.post('/achievements-group/admin', formData)) as any;
    // Invalidate cache or update your frontend state if needed
    if (result.result === true) {
      queryClient.invalidateQueries('get-achievementsgroups');
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
  type: string;
  description: string;
  achievements: Achievement[];
  image: File;  // Assuming the image comes as a File object from the client
  deleteImage: boolean,
}) => {
  try {
    const formData = new FormData();
    formData.append('_id', payload.achievementId);
    formData.append('title', payload.title);
    formData.append('type', payload.type);
    formData.append('description', payload.description);
    formData.append('image', payload.image);
    formData.append('achievements', JSON.stringify(payload.achievements));
    const result = (await axios.put('/achievements-group/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-achievementsgroups');
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
