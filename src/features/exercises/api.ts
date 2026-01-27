import { Exercise, ErrorMessage, Filters, ExercisesResponse, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';
import { buildFormDataWithImages } from '@/utils/formDataBuilder';
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

export const createExercise = async (data:any) => {
    try {
      const formData = buildFormDataWithImages(data, ['thumbnail','videoThumbnail']);
      const result = (await axios.post('/exercises/admin', formData)) as ResponseMessage;
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
    payload: any;
  }) => {
    try {
      const formData = buildFormDataWithImages(payload, ['thumbnail','videoThumbnail']);
      formData.append('_id', exerciseId);
      const result = (await axios.put('/exercises/admin', formData)) as ResponseMessage;
      if (result.result === true) {
        queryClient.invalidateQueries('get-exercises');
        queryClient.invalidateQueries('get-exercise-titles');
        queryClient.invalidateQueries(['get-exercise', exerciseId]);
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
