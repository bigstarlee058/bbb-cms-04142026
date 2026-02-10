import { Faq, FaqsResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';
import { buildFormDataWithImages } from '@/utils/formDataBuilder';
export const fetchFaqs = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/faqs/admin/get`, {
      params: filters,
    })) as FaqsResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchFaq = async (faqId: string) => {
  try {
    const result = (await axios.get(`/faqs/admin/get/${faqId}`)) as Faq;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createFaq = async (payload) => {
  try {
    const formData = buildFormDataWithImages(payload, []);
    const result = (await axios.post('/faqs/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-faqs');
      return 'FAG successfully created.';
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


export const updateFaq = async (payload) => {
  try {
    const formData = buildFormDataWithImages(payload, []);
    formData.append('_id', payload.faqId);
    const result = (await axios.put('/faqs/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-faqs');
      queryClient.invalidateQueries(['get-faq', payload.faqId]);
      return 'FAQ successfully updated.';
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

export const deleteFaq = async (faqsId: string) => {
  try {
    const result = (await axios.delete(`/faqs/admin/${faqsId}`)) as ResponseMessage;
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
