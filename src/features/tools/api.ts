import { ToolsResponse, ErrorMessage } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchTools = async () => {
  try {
    const result = (await axios.get(`/tools`)) as ToolsResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};
export const updateVisibility = async (payload: { 
  toolId: string
  visible: boolean
}) => {
  try {
    const result = await axios.patch(`/tools/${payload.toolId}/visibility`, {
      visible: payload.visible
    });
    if (result.data?.result === true) {
      queryClient.invalidateQueries('get-tools');
      queryClient.invalidateQueries(['get-tool', payload.toolId]);
      return 'Tool visibility successfully updated.';
    }

    return result.data?.message || 'Failed to update visibility.';
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err.message || String(err),
    };
    return Promise.reject(error);
  }
};