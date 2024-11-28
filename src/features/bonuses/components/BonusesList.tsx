import { useEffect, useState } from 'react';
import { Table, Spinner, Link, Button } from '@/components/Elements';
import { formatDate } from '@/utils/format';
import { useQuery } from 'react-query';
import { fetchBonuses } from '../api';
import { Bonus, Filters } from '@/types';
import { DeleteBonus } from './DeleteBonus';
import { EyeIcon } from '@heroicons/react/outline';
import { UpdateBonus } from './UpdateBonus';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const BonusesList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
  });

  const {
    data: bonusData,
    isLoading,
    refetch,
  } = useQuery(['get-bonuses'], () => fetchBonuses(filters));

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

  if (!bonusData) return null;

  return (
    <>
      <Table<Bonus>
        data={bonusData.bonuses}
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
              return <UpdateBonus bonusId={_id} bonuses={bonusData} />;
            },
          },
          {
            title: '',
            field: '_id',
            Cell({ entry: { _id } }) {
              return <DeleteBonus bonusId={_id} />;
            },
          },
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil(bonusData.count / (filters?.perPage || 10))}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
