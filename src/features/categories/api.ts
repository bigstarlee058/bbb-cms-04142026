import { Category, ErrorMessage, ResponseMessage } from '@/types';
import { storage } from '@/utils/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchCategories = async () => {
  try {
    const categories = (await axios.get('/categories')) as Category[];
    return categories;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchCategory = async (categoryId: string) => {
  try {
    const result = (await axios.get(`/categories/${categoryId}`)) as Category;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createCategory = async (payload: { title: string; image: File }) => {
  try {
    const storageRef = ref(storage, 'category_thumbnails/' + Date.now() + '_' + payload.image.name);
    await uploadBytes(storageRef, payload.image);
    const downloadURL = await getDownloadURL(storageRef);
    const newCategory = {
      createdAt: Date.now(),
      title: payload.title,
      thumbnail: downloadURL,
    };
    const result = (await axios.post('/categories', newCategory)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-categories');
      return 'Category successfully created.';
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

export const updateCategory = async ({
  categoryId,
  payload,
}: {
  categoryId: string;
  payload: { title: string; image: File };
}) => {
  try {
    let downloadURL = undefined;
    if (payload.image.name) {
      const storageRef = ref(
        storage,
        'category_thumbnails/' + Date.now() + '_' + payload.image.name
      );
      await uploadBytes(storageRef, payload.image);
      downloadURL = await getDownloadURL(storageRef);
    }

    const updatedCategory = {
      _id: categoryId,
      title: payload.title,
      thumbnail: downloadURL,
      updatedAt: Date.now(),
    };
    const result = (await axios.put('/categories', updatedCategory)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries(['get-category', categoryId]);
      return 'Category successfully updated.';
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

export const deleteCategory = async (categoryId: string) => {
  try {
    const result = (await axios.delete(`/categories/${categoryId}`)) as ResponseMessage;
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
