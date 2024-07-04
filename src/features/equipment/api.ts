import { Equipment, ErrorMessage, ResponseMessage } from '@/types';
import { storage } from '@/utils/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchEquipments = async (): Promise<Equipment[]> => {
  try {
    const equipmentData = (await axios.get('/equipments')) as Equipment[];
    return Promise.resolve(equipmentData);
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
    const result = (await axios.get(`/equipments/${equipmentId}`)) as Equipment;
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
  link: string;
  price: number;
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
    const result = (await axios.post('/equipments', newEquipment)) as ResponseMessage;
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
  payload: { title: string; link: string; price: number; image: File };
}) => {
  try {
    console.log(payload);
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
      createdAt: Date.now(),
    };
    const result = (await axios.put('/equipments', updatedEquipment)) as ResponseMessage;
    if (result.result === true) {
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
    const result = (await axios.delete(`/equipments/${equipmentId}`)) as ResponseMessage;
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
