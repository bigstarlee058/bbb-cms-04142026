import { Tags, TagsResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';
import { buildFormDataWithImages } from '@/utils/formDataBuilder';
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

export const createTag = async (payload:any) => {
  try {
    const formData = buildFormDataWithImages(payload, []);
    const result = (await axios.post('/tags/admin', formData)) as any;
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


export const updateTag = async ({tagId,payload}) => {
  try {
    const formData = buildFormDataWithImages(payload, []);
      formData.append('_id', tagId);
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
