import { useEffect, useState } from 'react';
import { Table, Spinner, Link, Button } from '@/components/Elements';
import { formatDate } from '@/utils/format';
import { Restday, Filters } from '@/types';
import { DeleteRestday } from './DeleteRestday';
import { EyeIcon } from '@heroicons/react/outline';
import { UpdateRestday } from './UpdateRestday';
import { useQuery } from 'react-query';
import { fetchRestdays } from '../api';
import { fetchEquipmentTitles } from '@/features/workouts/api';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const RestdayList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const {search, sortBy} = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
  });

  const {
    data: restdayData,
    isLoading,
    refetch,
  } = useQuery(['get-restdays'], () => fetchRestdays(filters));
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

  if (!restdayData) return null;

  return (
    <>
      <Table<Restday>
        data={restdayData.restdays}
        columns={[
          {
            title: 'Title',
            field: 'title',
          },
          {
            title: 'Vimeo',
            field: 'vimeoId',
          },
          {
            title: 'Description',
            field: 'description',
          },
          {
            title: 'Equipments',
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
            title: 'Created At',
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
              return <UpdateRestday restdayId={_id} restdays={restdayData} titles={titles} />;
            },
          },
          {
            title: '',
            field: '_id',
            Cell({ entry: { _id } }) {
              return <DeleteRestday restdayId={_id} />;
            },
          },
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil(restdayData.count / (filters?.perPage || 10))}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
