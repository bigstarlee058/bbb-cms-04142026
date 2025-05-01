import { Faqs, FaqsesResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchFaqses = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/faqs/admin/get`, {
      params: filters,
    })) as FaqsesResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchFaqs = async (faqsId: string) => {
  try {
    const result = (await axios.get(`/faqs/admin/get/${faqsId}`)) as Faqs;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createFaqs = async (payload: {
  question: string;
  answer: string;
}) => {
  try {
    const formData = new FormData();
    formData.append('question', payload.question);
    formData.append('answer', payload.answer);
    const result = (await axios.post('/faqs/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-faqses');
      return 'Faqs successfully created.';
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


export const updateFaqs = async (payload: {
  faqsId: string 
  question: string;
  answer: string;
}) => {
  try {
    const formData = new FormData();
    formData.append('_id', payload.faqsId);
    formData.append('question', payload.question);
    formData.append('answer', payload.answer);
    const result = (await axios.put('/faqs/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-faqses');
      queryClient.invalidateQueries(['get-faqs', payload.faqsId]);
      return 'Faqs successfully updated.';
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

export const deleteFaqs = async (faqsId: string) => {
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
