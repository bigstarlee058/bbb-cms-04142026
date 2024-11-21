import { Challenge, ChallengesResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchChallenges = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/challenges/admin/get`, {
      params: filters,
    })) as ChallengesResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchChallenge = async (challengeId: string) => {
  try {
    const result = (await axios.get(`/challenges/admin/get/${challengeId}`)) as Challenge;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createChallenge = async (payload: {
  title: string;
  image: File;  // Assuming the image comes as a File object from the client
  description: string
}) => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('image', payload.image);
    formData.append('description', payload.description);
    // Post the new category data (including the image) to your backend
    const result = (await axios.post('/challenges/admin', formData)) as ResponseMessage;
    // Invalidate cache or update your frontend state if needed
    if (result.result === true) {
      queryClient.invalidateQueries('get-challenges');
      return 'Challenge successfully created.';
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


export const updateChallenge = async (payload: {
  challengeId: string 
  title: string;
  image: File;  // Assuming the image comes as a File object from the client
  description: string;
  deleteImage: Boolean
}) => {
  try {
    const formData = new FormData();
    formData.append('_id', payload.challengeId);
    formData.append('title', payload.title);
    formData.append('image', payload.image);
    formData.append('description', payload.description);
    formData.append('deleteImage', String(payload.deleteImage));
    const result = (await axios.put('/challenges/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-challenges');
      queryClient.invalidateQueries(['get-challenge', payload.challengeId]);
      return 'Challenge successfully updated.';
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

export const deleteChallenge = async (challengeId: string) => {
  try {
    const result = (await axios.delete(`/challenges/admin/${challengeId}`)) as ResponseMessage;
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
