import { Bonus, BonusesResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchAllBonuses = async (): Promise<Bonus[]> => {
  try {
    const bonuses = (await axios.get('/bonuses/admin/get')) as Bonus[];
    return bonuses;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchBonuses = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/bonuses/admin/get`, {
      params: filters,
    })) as BonusesResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchBonus = async (bonusId: string) => {
  try {
    const result = (await axios.get(`/bonuses/admin/get/${bonusId}`)) as Bonus;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createBonus = async (payload: {
  title: string;
  description: string;
  image: File;
  isFeatured: boolean;
}) => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('image', payload.image);
    formData.append('description', payload.description);
    formData.append('isFeatured', String(payload.isFeatured));
    // Post the new category data (including the image) to your backend
    const result = (await axios.post('/bonuses/admin', formData)) as ResponseMessage;
    // Invalidate cache or update your frontend state if needed
    if (result.result === true) {
      queryClient.invalidateQueries('get-bonuses');
      return 'Bonus successfully created.';
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

export const updateBonus = async (payload: {
  bonusId: string 
  title: string;
  description: string;
  image: File;  // Assuming the image comes as a File object from the client
  deleteImage: boolean;
  isFeatured: boolean;
}) => {
  try {
    const formData = new FormData();
    formData.append('_id', payload.bonusId);
    formData.append('title', payload.title);
    formData.append('image', payload.image);
    formData.append('deleteImage', String(payload.deleteImage));
    formData.append('description', payload.description);
    formData.append('isFeatured', String(payload.isFeatured));
    const result = (await axios.put('/bonuses/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-bonuses');
      queryClient.invalidateQueries(['get-bonus', payload.bonusId]);
      return 'Bonus successfully updated.';
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

export const deleteBonus = async (bonusId: string) => {
  try {
    const result = (await axios.delete(`/bonuses/admin/${bonusId}`)) as ResponseMessage;
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
