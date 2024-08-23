import { Equipment, EquipmentsResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { storage } from '@/utils/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
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
    const storageRef = ref(
      storage,
      'equipment_thumbnails/' + Date.now() + '_' + payload.image.name
    );
    await uploadBytes(storageRef, payload.image);
    const downloadURL = await getDownloadURL(storageRef);
    const newEquipment = {
      ...payload,
      thumbnail: downloadURL,
      createdAt: Date.now(),
    };
    const result = (await axios.post('/equipments/admin', newEquipment)) as ResponseMessage;
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
    return Promise.reject(error);
  }
};

export const updateEquipment = async ({
  equipmentId,
  payload,
}: {
  equipmentId: string;
  payload: { title: string; description: string; link: string; image: File };
}) => {
  try {
    let downloadURL = undefined;
    if (payload.image.name) {
      const storageRef = ref(
        storage,
        'equipment_thumbnails/' + Date.now() + '_' + payload.image.name
      );
      await uploadBytes(storageRef, payload.image);
      downloadURL = await getDownloadURL(storageRef);
    }

    const updatedEquipment = {
      ...payload,
      _id: equipmentId,
      thumbnail: downloadURL,
      updatedAt: Date.now(),
    };
    const result = (await axios.put('/equipments/admin', updatedEquipment)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-equipments');
      queryClient.invalidateQueries(['get-equipment', equipmentId]);
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
