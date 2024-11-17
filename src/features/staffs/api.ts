import { Staff, StaffsResponse, ErrorMessage, Filters, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

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

export const createStaff = async (payload: {
  title: string;
  image: File;  // Assuming the image comes as a File object from the client
  type: number;
  bio: string
}) => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('image', payload.image);
    formData.append('type', payload.type.toString());
    formData.append('bio', payload.bio);
    // Post the new category data (including the image) to your backend
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


export const updateStaff = async (payload: {
  staffId: string 
  title: string;
  image: File;  // Assuming the image comes as a File object from the client
  type: number;
  bio: string;
  deleteImage: Boolean
}) => {
  try {
    const formData = new FormData();
    formData.append('_id', payload.staffId);
    formData.append('title', payload.title);
    formData.append('image', payload.image);
    formData.append('type', payload.type.toString());
    formData.append('bio', payload.bio);
    formData.append('deleteImage', String(payload.deleteImage));
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
