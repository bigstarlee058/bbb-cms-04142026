import { Exercise, ErrorMessage, Filters, ExercisesResponse, ResponseMessage } from '@/types';
import { storage } from '@/utils/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchExercises = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/exercises/admin`, { params: filters })) as ExercisesResponse;
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
    const result = (await axios.get(`/exercises/admin/${exerciseId}`)) as Exercise;
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
}) => {
  try {
    const storageRef = ref(storage, 'exercise_thumbnails/' + payload.image.name);
    await uploadBytes(storageRef, payload.image);
    const downloadURL = await getDownloadURL(storageRef);
    const newExercise = {
      ...payload,
      thumbnail: downloadURL,
      createdAt: Date.now(),
    };
    const result = (await axios.post('/exercises/admin', newExercise)) as ResponseMessage;
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
    return Promise.reject(error);
  }
};

export const updateExercise = async ({
  exerciseId,
  payload,
}: {
  exerciseId: string;
  payload: { title: string; description: string; vimeoId: string; image: File };
}) => {
  try {
    let downloadURL = undefined;
    if (payload.image.name) {
      const storageRef = ref(storage, 'exercise_thumbnails/' + payload.image.name);
      await uploadBytes(storageRef, payload.image);
      downloadURL = await getDownloadURL(storageRef);
    }

    const updatedCollection = {
      ...payload,
      _id: exerciseId,
      thumbnail: downloadURL,
      updatedAt: Date.now(),
    };
    const result = (await axios.put('/exercises/admin', updatedCollection)) as ResponseMessage;
    if (result.result === true) {
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
