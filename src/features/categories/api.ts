import { Category, CategoriesResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';
import { buildFormDataWithImages } from '@/utils/formDataBuilder';
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

export const createCategory = async (data:any) => {
  try {
    const formData = buildFormDataWithImages(data, []);
    const result = (await axios.post('/categories/admin', formData)) as any;
    if (result.result === true) {
      queryClient.invalidateQueries('get-categories');
      return result.category;
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


export const updateCategory = async ({
    categoryId,
    payload,
  }: {
    categoryId: string;
    payload: any;
  }) => {
  try {
    const formData = buildFormDataWithImages(payload, []);
      formData.append('_id', categoryId);
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
