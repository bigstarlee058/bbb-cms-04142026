import { useState } from 'react';
import { Table, Spinner } from '@/components/Elements';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchTools, updateVisibility } from '../api';
import { Tools } from '@/types';
import Pagination from '@/components/Elements/Pagination';
import { useNotificationStore } from '@/stores/notifications';
export const ToolsList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const queryClient = useQueryClient();

  const { data: toolsData, isLoading } = useQuery(['get-tools'], fetchTools);
const { addNotification } = useNotificationStore();
  const mutation = useMutation(updateVisibility, {
    onSuccess: (message: string) => {
      queryClient.invalidateQueries('get-tools');
       addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const handleVisibilityToggle = (toolId: string, currentVisible: boolean) => {
    mutation.mutate({
      toolId,
      visible: !currentVisible,
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!toolsData) return null;
  const total = toolsData.tools.length;
  const lastPage = Math.ceil(total / perPage);
  const paginatedTools = toolsData.tools.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );
  return (
    <>
      <Table<Tools>
        data={paginatedTools}
        columns={[
          { title: 'Name', field: 'toolName' },
          { title: 'Title', field: 'title' },
          {
            title: 'Visible',
            field: 'visible',
            Cell({ entry }) {
              return (
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={entry.visible}
                    onChange={() => handleVisibilityToggle(entry._id, entry.visible)}
                  />
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors 
                      ${entry.visible ? 'bg-red-500 peer-checked:bg-[#9a354e]' : 'bg-gray-300 peer-checked:bg-green-500'}`}
                  >
                    <span
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform 
                        ${entry.visible ? 'translate-x-5' : ''}`}
                    />
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${entry.visible ? 'text-[#9a354e]' : 'text-gray-900'}`}
                  >
                    {entry.visible ? 'Yes' : 'No'}
                  </span>
                </label>
              );
            },
          },
        ]}
      />

      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};