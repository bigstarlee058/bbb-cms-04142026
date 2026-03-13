import { ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';
import { buildFormDataWithImages } from '@/utils/formDataBuilder';

export interface Download {
  _id: string;
  title: string;
  titleTranslations?: Record<string, string>;
  description: string;
  descriptionTranslations?: Record<string, string>;
  pdf: string;
  pdfTranslations?: Record<string, string>;
  releaseDate: string;
  monthId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DownloadsResponse {
  count: number;
  downloads: Download[];
}

export const fetchDownloads = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/downloads/admin/get`, {
      params: filters,
    })) as DownloadsResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchDownload = async (downloadId: string) => {
  try {
    const result = (await axios.get(`/downloads/admin/get/${downloadId}`)) as Download;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createDownload = async (payload: any) => {
  try {
    const formData = buildFormDataWithImages(payload, ['pdf']);
    const result = (await axios.post('/downloads/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-downloads');
      return 'Download successfully created.';
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

export const updateDownload = async (payload: any) => {
  try {
    const formData = buildFormDataWithImages(payload, ['pdf']);
    formData.append('_id', payload.downloadId);
    const result = (await axios.put('/downloads/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-downloads');
      queryClient.invalidateQueries(['get-download', payload.downloadId]);
      return 'Download successfully updated.';
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

export const deleteDownload = async (downloadId: string) => {
  try {
    const result = (await axios.delete(`/downloads/admin/${downloadId}`)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-downloads');
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

export const toggleDownloadFeatured = async (downloadId: string, isFeatured: boolean) => {
  try {
    const result = (await axios.put('/downloads/admin/toggle-featured', {
      downloadId,
      isFeatured,
    })) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-downloads');
      return result.message;
    }
    return Promise.reject(result.message);
  } catch (err: any) {
    return Promise.reject(err);
  }
};