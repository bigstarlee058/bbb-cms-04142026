import { Table, Spinner, Link, Button } from '@/components/Elements';
import { useQuery } from 'react-query';
import { fetchExercises } from '../api';
import { Exercise, Filters } from '@/types';
import { DeleteExercise } from './DeleteExercise';
import { useEffect, useState } from 'react';
import { EyeIcon } from '@heroicons/react/solid';
import { UpdateExercise } from './UpdateExercise';
import { fetchCategoryTitles, fetchTagTitles, fetchEquipmentTitles, fetchExerciseTitles } from '@/features/workouts/api';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const ExercisesList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1
  });
  const { data: exercises, isLoading, refetch } = useQuery(['get-exercises'], () => fetchExercises(filters));
  const { data: exerciseTitles } = useQuery('get-exercise-titles', () => fetchExerciseTitles({ filterString: '' }));
  const { data: equipmentTitles } = useQuery('get-equipment-titles', () => fetchEquipmentTitles({ filterString: '' }));
  const { data: categoryTitles, refetch: refetchCategoryTitles } = useQuery('get-category-titles', () =>
    fetchCategoryTitles({ filterString: '' })
  );
  const { data: tagTitles, refetch: refetchTagTitles } = useQuery('get-tag-titles', () => fetchTagTitles({ filterString: '' })
  );
  useEffect(() => {
    refetch();
  }, [filters]);

  useEffect(() => {
    setFilters({
      ...filters,
      page: currentPage
    });
  }, [currentPage]);

  useEffect(() => {
    setFilters((p) => ({ ...p, search: search }));
  }, [search]);

  useEffect(() => {
    setFilters({
      ...filters,
      sortBy: sortBy?.value
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
            field: 'title'
          },
          {
            title: 'Thumbnail',
            field: 'thumbnail',
            Cell({ entry: { thumbnail } }) {
              return (
                <div className="justify-center items-center">
                  <img className="h-24 object-contain" src={thumbnail} />
                </div>
              );
            }
          },
          {
            title: 'Description',
            field: 'description',
            Cell({ entry: { description } }) {
              // return <p>{description.length > 100 ? `${description.slice(0, 100)}...` : description}</p>;
              return (
                <span
                  dangerouslySetInnerHTML={{
                    __html: description.length > 100 ? `${description.slice(0, 100)}...` : description,
                  }}
                />
              );
            }
          },
          {
            title: 'Categories',
            field: 'categories',
            minwidth: 150,
            Cell({ entry: { categories } }) {
              if (!categoryTitles) return null; // Check if titles is defined
              const filteredTitles = categoryTitles
                .filter((title) => categories.includes(title.id))
                .map((title) => title.title)
                .join(', ');
              return <span>{filteredTitles}</span>;
            }
          },
          {
            title: 'Tags',
            field: 'tags',
            minwidth: 150,
            Cell({ entry: { tags } }) {
              if (!tagTitles) return null; 
              if (!tags) return null; // Check if titles is defined
              const filteredTitles = tagTitles
                .filter((title) => tags.includes(title.id))
                .map((title) => title.title)
                .join(', ');
              return <span>{filteredTitles}</span>;
            }
          },
          {
            title: 'Equipment',
            field: 'usedEquipments',
            Cell({ entry: { usedEquipments } }) {
              if (!equipmentTitles) return null; // Check if titles is defined
              const filteredTitles = equipmentTitles
                .filter((title) => usedEquipments.includes(title.id))
                .map((title) => title.title)
                .join(', ');
              return <span>{filteredTitles}</span>;
            }
          },
          {
            title: 'Vimeo',
            field: 'vimeoId',
            Cell({ entry: { vimeoId } }) {
              return <p>{vimeoId}</p>;
            }
          },
          {
            title: 'View',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return (
                <Link to={`./${_id}`}>
                  <Button variant="danger" startIcon={<EyeIcon className="h-4 w-4" />} />
                </Link>
              );
            }
          },
          {
            title: 'Edit',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return (
                <UpdateExercise
                  exerciseId={_id}
                  exercises={exercises}
                  exTitles={exerciseTitles}
                  eqTitles={equipmentTitles}
                  caTitles={categoryTitles}
                  tagTitles={tagTitles}
                  onCategoryCreate={refetchCategoryTitles}
                  onTagCreate={refetchTagTitles}
                />
              );
            }
          },
          {
            title: 'Delete',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteExercise exerciseId={_id} />;
            }
          }
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
