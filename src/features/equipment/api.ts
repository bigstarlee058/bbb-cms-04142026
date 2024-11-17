import { Equipment, EquipmentsResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchEquipments = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/equipments/admin/get`, {
      params: filters,
    })) as EquipmentsResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchEquipment = async (equipmentId: string) => {
  try {
    const result = (await axios.get(`/equipments/admin/get/${equipmentId}`)) as Equipment;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createEquipment = async (payload: {
  title: string;
  description: string;
  link: string;
  image: File;
}) => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('image', payload.image);
    formData.append('description', payload.description);
    formData.append('link', payload.link);
    // Post the new category data (including the image) to your backend
    const result = (await axios.post('/equipments/admin', formData)) as ResponseMessage;
    // Invalidate cache or update your frontend state if needed
    if (result.result === true) {
      queryClient.invalidateQueries('get-equipments');
      return 'Equipment successfully created.';
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

export const updateEquipment = async (payload: {
  equipmentId: string 
  title: string;
  description: string;
  link: string;
  image: File;  // Assuming the image comes as a File object from the client
  deleteImage: Boolean
}) => {
  try {
    const formData = new FormData();
    formData.append('_id', payload.equipmentId);
    formData.append('title', payload.title);
    formData.append('image', payload.image);
    formData.append('deleteImage', String(payload.deleteImage));
    formData.append('description', payload.description);
    formData.append('link', payload.link);
    const result = (await axios.put('/equipments/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-equipments');
      queryClient.invalidateQueries(['get-equipment', payload.equipmentId]);
      return 'Equipment successfully updated.';
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

export const deleteEquipment = async (equipmentId: string) => {
  try {
    const result = (await axios.delete(`/equipments/admin/${equipmentId}`)) as ResponseMessage;
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
