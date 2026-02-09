import { Collection, CollectionsResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';
import { buildFormDataWithImages } from '@/utils/formDataBuilder';
export const fetchAllCollections = async (): Promise<Collection[]> => {
  try {
    const collections = (await axios.get('/collections/admin/get')) as Collection[];
    return collections;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchCollections = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/collections/admin/get`, {
      params: filters,
    })) as CollectionsResponse;
    return result;
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
    const result = (await axios.get(`/collections/admin/get/${collectionId}`)) as Collection;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createCollection = async (payload) => {
  try {
    const formData = buildFormDataWithImages(payload, ['thumbnail']);
    const result = (await axios.post('/collections/admin', formData)) as ResponseMessage;
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
    console.log(error);
    return Promise.reject(error);
  }
};

export const updateCollection = async (payload) => {
  try {
    const formData = buildFormDataWithImages(payload, ['thumbnail']);
    formData.append('_id', payload.collectionId);
    const result = (await axios.put('/collections/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-collections');
      queryClient.invalidateQueries(['get-collection', payload.collectionId]);
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
    const result = (await axios.delete(`/collections/admin/${collectionId}`)) as ResponseMessage;
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
