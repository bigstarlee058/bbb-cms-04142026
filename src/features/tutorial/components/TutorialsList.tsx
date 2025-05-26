import { useEffect, useState } from 'react';
import { Table, Spinner, Link, Button } from '@/components/Elements';
import { useQuery } from 'react-query';
import { fetchTutorials } from '../api';
import { Tutorial, Filters } from '@/types';
import { EyeIcon } from '@heroicons/react/outline';
import { DeleteTutorial } from './DeleteTutorial';
import { UpdateTutorial } from './UpdateTutorial';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const TutorialsList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
  });

  const {
    data: tutorialData,
    isLoading,
    refetch,
  } = useQuery(['get-tutorials'], () => fetchTutorials(filters));

  useEffect(() => {
    refetch();
  }, [filters]);

  useEffect(() => {
    setFilters({
      ...filters,
      page: currentPage,
    });
  }, [currentPage]);

  useEffect(() => {
    setFilters((p) => ({ ...p, search: search }));
  }, [search]);

  useEffect(() => {
    setFilters({
      ...filters,
      sortBy: sortBy?.value,
    });
  }, [sortBy]);

  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!tutorialData) return null;

  return (
    <>
      <Table<Tutorial>
        data={tutorialData.tutorials}
        columns={[
          {
            title: 'Title',
            field: 'title',
          },
          {
            title: 'Thumbnail',
            field: 'thumbnail',
            Cell({ entry: { thumbnail } }) {
              return (
              <div className="justify-center items-center">
                <img className="h-24 object-contain" src={thumbnail} />
              </div>);
            },
          }, 
          {
            title: 'Description',
            field: 'description',
            Cell({ entry: { description } }) {
              return <p>{description.length > 100 ? `${description.slice(0, 100)}...` : description}</p>;
            }
          },
          {
            title: 'VimeoId',
            field: 'vimeoId',
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <UpdateTutorial tutorialId={_id} tutorials={tutorialData} />;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteTutorial tutorialId={_id} />;
            },
          },
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil(tutorialData.count / (filters?.perPage || 10))}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
