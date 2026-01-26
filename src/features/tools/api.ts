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
export const createTool = async (payload: {
  title: string;
  toolName: string;
  titleTranslations: Record<string, string>;
  visible: boolean;
}) => {
  try {

    const { title, toolName, visible,titleTranslations } = payload
    const result = (await axios.post('/tools', { title, toolName, titleTranslations,visible })) as any;
    if (result?._id) {
      queryClient.invalidateQueries('get-tools');
      return result;
    }
    return result.message;
  } catch (err: any) {
   const message = err?.response?.data?.message;
    return Promise.reject(message || 'Unexpected error');
  }
};
export const deleteTool = async (toolId: string) => {
  try {
    const result = (await axios.delete(`/tools/${toolId}`)) as any;
    if (result.result === true) {
      queryClient.invalidateQueries('get-tools');
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
export const updateTool = async (payload: {
  toolId: string;
  title?: string;
  titleTranslations: Record<string, string>;
  toolName?: string;
  visible?: boolean;
}) => {
  try {
    const { toolId, ...updatedFields } = payload;
    const response = (await axios.put(`/tools/${toolId}`, updatedFields)) as any;
    if (response.result === true) {
      queryClient.invalidateQueries('get-tools');
      queryClient.invalidateQueries(['get-tool', toolId]);
      return response.data?.tool || 'Tool successfully updated.';
    }
    return Promise.reject(response.data?.message || 'Failed to update tool.');
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err.message || String(err),
    };
    console.error(error);
    return Promise.reject(error);
  }
};