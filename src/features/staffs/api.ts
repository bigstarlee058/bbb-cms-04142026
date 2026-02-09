import { Staff, StaffsResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';
import { buildFormDataWithImages } from '@/utils/formDataBuilder';
export const fetchStaffs = async (filters: Filters) => {
  try {
    const result = (await axios.get(`/staffs/admin/get`, {
      params: filters,
    })) as StaffsResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchStaff = async (staffId: string) => {
  try {
    const result = (await axios.get(`/staffs/admin/get/${staffId}`)) as Staff;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createStaff = async (payload) => {
  try {
    const formData = buildFormDataWithImages(payload, []);
    const result = (await axios.post('/staffs/admin', formData)) as ResponseMessage;
    // Invalidate cache or update your frontend state if needed
    if (result.result === true) {
      queryClient.invalidateQueries('get-staffs');
      return 'Staff successfully created.';
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


export const updateStaff = async (payload) => {
  try {
    const formData = buildFormDataWithImages(payload, []);
    formData.append('_id', payload.staffId);
    const result = (await axios.put('/staffs/admin', formData)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-staffs');
      queryClient.invalidateQueries(['get-staff', payload.staffId]);
      return 'Staff successfully updated.';
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

export const deleteStaff = async (staffId: string) => {
  try {
    const result = (await axios.delete(`/staffs/admin/${staffId}`)) as ResponseMessage;
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
