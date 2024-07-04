import { Collection, ErrorMessage, ResponseMessage } from '@/types';
import { storage } from '@/utils/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchAllCollections = async (): Promise<Collection[]> => {
  try {
    const collections = (await axios.get('/collections/all')) as Collection[];
    return collections;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchCollections = async (): Promise<Collection[]> => {
  try {
    const collections = (await axios.get('/collections')) as Collection[];
    return collections;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchCollection = async (collectionId: string) => {
  try {
    const result = (await axios.get(`/collections/${collectionId}`)) as Collection;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createCollection = async (payload: { title: string; image: File }) => {
  try {
    const storageRef = ref(
      storage,
      'collection_thumbnails/' + Date.now() + '_' + payload.image.name
    );
    await uploadBytes(storageRef, payload.image);
    const downloadURL = await getDownloadURL(storageRef);
    const newCollection = {
      ...payload,
      thumbnail: downloadURL,
      createdAt: Date.now(),
    };
    const result = (await axios.post('/collections', newCollection)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-collections');
      return 'Collection successfully created.';
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

export const updateCollection = async ({
  collectionId,
  payload,
}: {
  collectionId: string;
  payload: { title: string; image: File };
}) => {
  try {
    let downloadURL = undefined;
    if (payload.image.name) {
      const storageRef = ref(storage, 'collection_thumbnails/' + payload.image.name);
      await uploadBytes(storageRef, payload.image);
      downloadURL = await getDownloadURL(storageRef);
    }

    const updatedCollection = {
      ...payload,
      _id: collectionId,
      thumbnail: downloadURL,
      updatedAt: Date.now(),
    };
    const result = (await axios.put('/collections', updatedCollection)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries(['get-collection', collectionId]);
      return 'Collection successfully updated.';
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

export const deleteCollection = async (collectionId: string) => {
  try {
    const result = (await axios.delete(`/collections/${collectionId}`)) as ResponseMessage;
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
