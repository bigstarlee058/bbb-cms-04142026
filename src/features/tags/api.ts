import { Tags, TagsResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchTags = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/tags/admin/get`, {
      params: filters,
    })) as TagsResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchTag = async (tagId: string) => {
  try {
    const result = (await axios.get(`/tags/admin/get/${tagId}`)) as Tags;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createTag = async (payload: {
  title: string;
  image?: File;  // Assuming the image comes as a File object from the client
}) => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('image', payload.image);
    // Post the new tag data (including the image) to your backend
    const result = (await axios.post('/tags/admin', formData)) as any;
    // Invalidate cache or update your frontend state if needed
    if (result.result === true) {
      queryClient.invalidateQueries('get-tags');
      return result.tag;
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


export const updateTag = async (payload: {
  tagId: string 
  title: string;
  image: File;  // Assuming the image comes as a File object from the client
  deleteImage: Boolean
}) => {
  try {
    const formData = new FormData();
    formData.append('_id', payload.tagId);
    formData.append('title', payload.title);
    formData.append('image', payload.image);
    formData.append('deleteImage', String(payload.deleteImage));
    const result = (await axios.put('/tags/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-tags');
      queryClient.invalidateQueries(['get-tag', payload.tagId]);
      return 'Tag successfully updated.';
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

export const deleteTag = async (tagId: string) => {
  try {
    const result = (await axios.delete(`/tags/admin/${tagId}`)) as ResponseMessage;
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
