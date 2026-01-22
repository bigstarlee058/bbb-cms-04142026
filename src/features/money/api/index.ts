import { axios } from "@/lib/axios";
import { TargetCriteria, UpsellResponse, UpsellsResponse } from "../types";
export const upsellApi = {
  getAll: async (): Promise<UpsellsResponse> => {
    const response = await axios.get("/money/upsells");
    return {data : response.data};
  },

  getActive: async (): Promise<UpsellsResponse> => {
    const response = await axios.get("/money/upsells/active");
    return response.data;
  },
  getById: async (id: string): Promise<UpsellResponse> => {
    const response = await axios.get(`/money/upsells/${id}`);
    return response.data;
  },

create: async (data: any) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (key === 'image') {
            if (value instanceof File) {
                formData.append('image', value);
            } else if (typeof value === 'string' && value !== '') {
                formData.append('image', value);
            }
        } 
        else if (key === 'targetCriteria') {
            formData.append(key, JSON.stringify(value));
        }
        else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
        }
        else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
        }
    });

    const response = await axios.post('/money/upsells', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
},

update: async ({ upsellId, ...data }: any) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (key === 'image') {
            if (value instanceof File) {
                formData.append('image', value);
            } else if (typeof value === 'string' && value !== '') {
                formData.append('image', value);
            }
        }
        else if (key === 'targetCriteria' || Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
        }
        else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
        }
    });

    const response = await axios.put(`/money/upsells/${upsellId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
},

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`/money/upsells/${id}`);
    return response.data;
  },

  toggleActive: async (id: string, isActive: boolean): Promise<UpsellResponse> => {
    const response = await axios.put(`/money/upsells/${id}`, { isActive });
    return response.data;
  },
    countUsersByCriteria: async (data: {
    targetType: 'all' | 'specific' | 'criteria';
    criteria?: TargetCriteria;
    targetUserIds?: string[];
  }): Promise<{ count: number }> => {
    const response = await axios.post('/money/upsells/count-users', data);
    return response.data;
  },
  getDismissCount: async (upsellId: string): Promise<{ count: number }> => {
  const response = await axios.get(`/money/upsells/${upsellId}/dismiss-count`);
  return response.data;
},
};
