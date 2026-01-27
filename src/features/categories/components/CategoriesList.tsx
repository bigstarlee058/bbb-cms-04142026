import { useEffect, useState } from 'react';
import { Table, Spinner, Link, Button } from '@/components/Elements';
import { useQuery } from 'react-query';
import { fetchCategories } from '../api';
import { Category, Filters } from '@/types';
import { EyeIcon } from '@heroicons/react/outline';
import { DeleteCategory } from './DeleteCategory';
import { UpdateCategory } from './UpdateCategory';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const CategoriesList =  ({ getValue }: { getValue: (item: any, field: string) => any }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
  });

  const {
    data: categoryData,
    isLoading,
    refetch,
  } = useQuery(['get-categories'], () => fetchCategories(filters));

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

  if (!categoryData) return null;

  return (
    <>
      <Table<Category>
        data={categoryData.categories}
        columns={[
          {
            title: 'Title',
            field: 'title',
             Cell({entry}){
              return getValue(entry,'title')
            }
          },
          {
            title: 'Thumbnail',
            field: 'thumbnail',
            Cell({ entry}) {
              return (
              <div className="justify-center items-center">
                <img className="h-24 object-contain" src={getValue(entry,'thumbnail')} />
              </div>);
            },
          },
          {
            title: 'Exercise Count',
            field: 'exerciseCount',
          },
          {
            title: '',
            field: '_id',
            width: 70,
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
            width: 70,
            Cell({ entry: { _id } }) {
              return <UpdateCategory categoryId={_id} categories={categoryData} />;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteCategory categoryId={_id} />;
            },
          },
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil(categoryData.count / (filters?.perPage || 10))}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
