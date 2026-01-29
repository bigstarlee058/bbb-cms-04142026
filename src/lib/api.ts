import { axios } from '@/lib/axios';

export interface Language {
  _id: string;
  key: string;
  inUse:boolean;
  name: string;
}
export const adminLanguages = async (): Promise<Language[]> => {
  const { data } = await axios.get('/settings/admin/languages');
  return data.languages || [];
};
export const fetchLanguages = async (): Promise<Language[]> => {
  const { data } = await axios.get('/settings/languages');
  return data.languages || [];
};
export const createLanguage = async (payload) => {
  const { data } = await axios.post('/settings/languages', payload);
  if (!data.result) throw new Error(data.message);
  return data.message;
};

export const updateLanguage = async ({ id, payload }) => {
  const { data } = await axios.put(`/settings/languages/${id}`, payload);
  if (!data.result) throw new Error(data.message);
  return data.message;
};

export const deleteLanguage = async (id) => {
  const { data } = await axios.delete(`/settings/languages/${id}`);
  if (!data.result) throw new Error(data.message);
  return data.message;
};