import { Category, CategoriesResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchCategories = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/categories/admin/get`, {
      params: filters,
    })) as CategoriesResponse;
    return result;
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
    const result = (await axios.get(`/categories/admin/get/${categoryId}`)) as Category;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createCategory = async (payload: {
  title: string;
  image: File;  // Assuming the image comes as a File object from the client
}) => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('image', payload.image);
    // Post the new category data (including the image) to your backend
    const result = (await axios.post('/categories/admin', formData)) as ResponseMessage;
    // Invalidate cache or update your frontend state if needed
    if (result.result === true) {
      console.log(result);
      queryClient.invalidateQueries('get-categories');
      return 'Category successfully created.';
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


export const updateCategory = async (payload: {
  categoryId: string 
  title: string;
  image: File;  // Assuming the image comes as a File object from the client
  deleteImage: Boolean
}) => {
  try {
    const formData = new FormData();
    formData.append('_id', payload.categoryId);
    formData.append('title', payload.title);
    formData.append('image', payload.image);
    formData.append('deleteImage', String(payload.deleteImage));
    const result = (await axios.put('/categories/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-categories');
      queryClient.invalidateQueries(['get-category', payload.categoryId]);
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
    const result = (await axios.delete(`/categories/admin/${categoryId}`)) as ResponseMessage;
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
