import { TagPayload, Tag, ErrorMessage, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchTags = async (): Promise<Tag[]> => {
  try {
    const tags = (await axios.get('/tags')) as Tag[];
    return tags;
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
    const result = (await axios.get(`/tags/${tagId}`)) as Tag;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createTag = async (payload: TagPayload) => {
  try {
    const newTag = {
      ...payload,
      createdAt: Date.now(),
    };
    const result = (await axios.post('/tags', newTag)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-tags');
      return 'Tag successfully created.';
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

export const updateTag = async ({ tagId, payload }: { tagId: string; payload: TagPayload }) => {
  try {
    const updatedTag = {
      ...payload,
      _id: tagId,
      createdAt: Date.now(),
    };
    const result = (await axios.put('/tags', updatedTag)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries(['get-tag', tagId]);
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
    const result = (await axios.delete(`/tags/${tagId}`)) as ResponseMessage;
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
