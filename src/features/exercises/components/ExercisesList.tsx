import { Table, Spinner, Link, ConfirmationDialog } from '@/components/Elements';
import { formatDate } from '@/utils/format';
import { useQuery } from 'react-query';
import { fetchExercises } from '../api';
import { Exercise, Filters } from '@/types';
import { DeleteExercise } from './DeleteExercise';
import { useEffect, useState } from 'react';
import useDebounce from '@/lib/useDebounce';
import Pagination from '@/components/Elements/Pagination';
import ReactSelect from 'react-select';
import reactSelectStylesConfig from '@/lib/react-select';
import { SearchField } from '@/components/ui/SearchField';

const SortOption = [
  // { label: 'Popularity', value: 'Popularity' },
  { label: 'Name: A to Z', value: 'NameAtoZ' },
  { label: 'Name: Z to A', value: 'NameZtoA' },
  { label: 'Newest Added', value: 'NewestAdded' },
  { label: 'Oldest Added', value: 'OldestAdded' },
];

export const ExercisesList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState(SortOption[0]);
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
    search: '',
    sortBy: sortOption.value,
    filter: {},
  });

  const { data, isLoading, refetch } = useQuery(['get-exercises'], () => fetchExercises(filters));

  const handleSortOptionChange = (val: any) => {
    setSortOption(val);
    setFilters({
      ...filters,
      sortBy: val.value,
    });
  };

  useEffect(() => {
    refetch();
  }, [filters]);
  useEffect(() => {
    setFilters({
      ...filters,
      page: currentPage,
    });
  }, [currentPage]);

  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <div className="flex gap-3 mb-3">
        <SearchField setSearchQuery={(val) => setFilters((p) => ({ ...p, search: val }))} />
        <ReactSelect
          styles={reactSelectStylesConfig}
          className="w-56 shrink hover:shrink-0 whitespace-nowrap"
          placeholder="Sort by"
          name="sortby"
          options={SortOption}
          value={sortOption}
          onChange={handleSortOptionChange}
        />
      </div>
      <Table<Exercise>
        data={data.exercises}
        columns={[
          {
            title: 'Title',
            field: 'title',
          },
          {
            title: 'Description',
            field: 'description',
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
              return <Link to={`./${_id}`}>View</Link>;
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
          lastPage={Math.ceil(data.count / (filters?.perPage || 10))}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
