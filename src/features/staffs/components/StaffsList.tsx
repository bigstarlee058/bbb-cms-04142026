import { useEffect, useState } from 'react';
import { Table, Spinner, Link, Button } from '@/components/Elements';
import { useQuery } from 'react-query';
import { fetchStaffs } from '../api';
import { Staff, Filters } from '@/types';
import { EyeIcon } from '@heroicons/react/outline';
import { DeleteStaff } from './DeleteStaff';
import { UpdateStaff } from './UpdateStaff';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const StaffsList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
  });

  const {
    data: staffData,
    isLoading,
    refetch,
  } = useQuery(['get-staffs'], () => fetchStaffs(filters));

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

  if (!staffData) return null;

  return (
    <>
      <Table<Staff>
        data={staffData.staffs}
        columns={[
          {
            title: 'Title',
            field: 'title',
          },
          {
            title: 'Location',
            field: 'location',
          },
          {
            title: 'Photo',
            field: 'photo',
            Cell({ entry: { photo } }) {
              return (
              <div className="justify-center items-center">
                <img className="h-24 object-contain" src={photo} />
              </div>);
            },
          },
          {
            title: 'Type',
            field: 'type',
            Cell({ entry: { type } }) {
              return (<>{type == 1 ? 'Staff' : 'Athlete'}</>);
            },
          },
          {
            title: 'Bio',
            field: 'bio',
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
              return <UpdateStaff staffId={_id} staffs={staffData} />;
            },
          },
          {
            title: '',
            field: '_id',
            Cell({ entry: { _id } }) {
              return <DeleteStaff staffId={_id} />;
            },
          },
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil(staffData.count / (filters?.perPage || 10))}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
