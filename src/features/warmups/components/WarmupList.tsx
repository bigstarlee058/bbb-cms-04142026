import { useEffect, useState } from 'react';
import { Table, Spinner, Link, Button } from '@/components/Elements';
import { formatDate } from '@/utils/format';
import { useQuery } from 'react-query';
import { fetchWarmups } from '../api';
import { Warmup, Filters } from '@/types';
import { DeleteWarmup } from './DeleteWarmup';
import { EyeIcon } from '@heroicons/react/outline';
import { UpdateWarmup } from './UpdateWarmup';
import { fetchEquipmentTitles } from '@/features/workouts/api';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const WarmupList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const {search, sortBy} = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
  });

  const {
    data: warmupData,
    isLoading,
    refetch,
  } = useQuery(['get-warmups'], () => fetchWarmups(filters));
  const { data: titles } = useQuery('get-equipment-titles', () =>
    fetchEquipmentTitles({ filterString: '' })
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

  if (!warmupData) return null;

  return (
    <>
      <Table<Warmup>
        data={warmupData.warmups}
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
            title: 'Length (min)',
            field: 'length',
          },
          {
            title: 'Description',
            field: 'description',
          },
          {
            title: 'Equipment',
            field: 'equipments',
            Cell({ entry: { equipments } }) {
              if (!titles) return null; // Check if titles is defined
              const filteredTitles = titles
                .filter((title) => equipments.includes(title.id))
                .map((title) => title.title)
                .join(', ');
              return <span>{filteredTitles}</span>;
            },
          },
          {
            title: 'Vimeo',
            field: 'vimeoId',
          },
          {
            title: 'Created On',
            field: 'createdAt',
            Cell({ entry: { createdAt } }) {
              return <span>{formatDate(createdAt)}</span>;
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
              return <UpdateWarmup warmupId={_id} warmups={warmupData} titles={titles} />;
            },
          },
          {
            title: '',
            field: '_id',
            Cell({ entry: { _id } }) {
              return <DeleteWarmup warmupId={_id} />;
            },
          },
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil(warmupData.count / (filters?.perPage || 10))}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};