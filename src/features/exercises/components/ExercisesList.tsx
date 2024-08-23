import { Table, Spinner, Link, Button } from '@/components/Elements';
import { useQuery } from 'react-query';
import { fetchExercises } from '../api';
import { Exercise, Filters } from '@/types';
import { DeleteExercise } from './DeleteExercise';
import { useEffect, useState } from 'react';
import { EyeIcon } from '@heroicons/react/solid';
import { UpdateExercise } from './UpdateExercise';
import { fetchExerciseTitles } from '@/features/workouts/api';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const ExercisesList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
  });
  const {
    data: exercises,
    isLoading,
    refetch,
  } = useQuery(['get-exercises'], () => fetchExercises(filters));
  const { data: titles } = useQuery('get-exercise-titles', () =>
    fetchExerciseTitles({ filterString: '' })
  );

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

  if (!exercises) return null;

  return (
    <>
      <Table<Exercise>
        data={exercises.exercises}
        columns={[
          {
            title: 'Title',
            field: 'title',
          },
          {
            title: 'Description',
            field: 'description',
            Cell({ entry: { description } }) {
              return (
                <p>{description.length > 50 ? `${description.slice(0, 50)}...` : description}</p>
              );
            },
          },
          {
            title: 'Categories',
            field: 'categories',
            Cell({ entry: { categories } }) {
              return (
                <p>
                  {categories.map((category) => {
                    return category + ' ';
                  })}
                </p>
              );
            },
          },
          {
            title: 'Thumbnail',
            field: 'thumbnail',
            Cell({ entry: { thumbnail } }) {
              return <img className="w-24" src={thumbnail} />;
            },
          },

          {
            title: 'Vimeo',
            field: 'vimeoId',
            Cell({ entry: { vimeoId } }) {
              return <p>{vimeoId}</p>;
            },
          },
          {
            title: '',
            field: '_id',
            Cell({ entry: { _id } }) {
              return (
                <Link to={`./${_id}`}>
                  <Button variant="danger" startIcon={<EyeIcon className="h-4 w-4" />} />
                </Link>
              );
            },
          },
          {
            title: '',
            field: '_id',
            Cell({ entry: { _id } }) {
              return <UpdateExercise exerciseId={_id} exercises={exercises} titles={titles} />;
            },
          },
          {
            title: '',
            field: '_id',
            Cell({ entry: { _id } }) {
              return <DeleteExercise exerciseId={_id} />;
            },
          },
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil(exercises.count / (filters?.perPage || 10))}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
