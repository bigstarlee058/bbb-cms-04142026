import { Exercise, ErrorMessage, Filters, ExercisesResponse, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchExercises = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/exercises/admin/get`, { params: filters })) as ExercisesResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchExercise = async (exerciseId: string) => {
  try {
    const result = (await axios.get(`/exercises/admin/get/${exerciseId}`)) as Exercise;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createExercise = async (payload: {
  title: string;
  description: string;
  vimeoId: string;
  image: File;
  videoImage: File;
  categories: [];
  tags: [];
  usedEquipments: [],
  relatedExercises: [],
}) => {
    try {
      const formData = new FormData();
      formData.append('title', payload.title);
      formData.append('image', payload.image);
      formData.append('videoImage', payload.videoImage);
      formData.append('description', payload.description);
      formData.append('vimeoId', payload.vimeoId);
      formData.append('categories', JSON.stringify(payload.categories));
      formData.append('tags', JSON.stringify(payload.tags));
      formData.append('usedEquipments', JSON.stringify(payload.usedEquipments));
      formData.append('relatedExercises', JSON.stringify(payload.relatedExercises));
      // Post the new category data (including the image) to your backend
      const result = (await axios.post('/exercises/admin', formData)) as ResponseMessage;
      // Invalidate cache or update your frontend state if needed
      if (result.result === true) {
        queryClient.invalidateQueries('get-exercises');
        return 'Exercise successfully created.';
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


  export const updateExercise = async ({
    exerciseId,
    payload,
  }: {
    exerciseId: string;
    payload: 
    {
      title: string;
      description: string;
      vimeoId: string;
      image: File;
      videoImage: File;
      categories: [];
      tags: [];
      usedEquipments: [],
      relatedExercises: [], 
    };
  }) => {
    try {
      const formData = new FormData();
      formData.append('_id', exerciseId);
      formData.append('title', payload.title);
      formData.append('image', payload.image);
      formData.append('videoImage', payload.videoImage);
      formData.append('description', payload.description);
      formData.append('vimeoId', payload.vimeoId);
      formData.append('categories', JSON.stringify(payload.categories));
      formData.append('tags', JSON.stringify(payload.tags));
      formData.append('usedEquipments', JSON.stringify(payload.usedEquipments));
      formData.append('relatedExercises', JSON.stringify(payload.relatedExercises));
      const result = (await axios.put('/exercises/admin', formData)) as ResponseMessage;
      if (result.result === true) {
        queryClient.invalidateQueries('get-exercises');
        queryClient.invalidateQueries('get-exercise-titles');
        queryClient.invalidateQueries(['get-exercise', exerciseId]);
        console.log('success');
        return 'Exercise successfully updated.';
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

export const deleteExercise = async (exerciseId: string) => {
  try {
    const result = (await axios.delete(`/exercises/admin/${exerciseId}`)) as ResponseMessage;
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
