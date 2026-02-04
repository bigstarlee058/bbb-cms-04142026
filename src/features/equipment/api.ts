import { Equipment, EquipmentsResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { buildFormDataWithImages } from '@/utils/formDataBuilder';
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

export const createEquipment = async (payload: any) => {
  try {
    const formData = buildFormDataWithImages(payload, []);
    // Post the new category data (including the image) to your backend
    const result = (await axios.post('/equipments/admin', formData)) as ResponseMessage;
    // Invalidate cache or update your frontend state if needed
    if (result.result === true) {
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

export const updateEquipment = async ({payload,
  equipmentId
}) => {
  try {
    const formData = buildFormDataWithImages(payload, []);
    formData.append('_id', equipmentId);
    
    const result = (await axios.put('/equipments/admin', formData)) as ResponseMessage;
    if (result.result === true) {
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
