import { Table, Spinner, Button } from '@/components/Elements';
import { formatDate } from '@/utils/format';
import { User, Filters } from '@/types';
import { fetchUsers } from '../api';
import { useQuery } from 'react-query';
import { DeleteUser } from './DeleteUser';
import Pagination from '@/components/Elements/Pagination';
import { useEffect, useState } from 'react';
import { useFilteringStore } from '@/stores/filter';
import { UserDetail } from '../UserDetail';

export const UsersList = () => {
  const { data, isLoading, refetch } = useQuery('get-users', () => fetchUsers(filters));
  const [currentPage, setCurrentPage] = useState(1);
  
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
    search: '',
    filter: {},
  });

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

  if (!data) return null;

  return (
    <>
      {/* <div className="flex gap-3 mb-3">
        <SearchField setSearchQuery={(val) => setFilters((p) => ({ ...p, search: val }))} />
      </div> */}
      <Table<User>
        data={data.users}
        columns={[
          {
            title: 'Name',
            field: 'name',
          },
          {
            title: 'Email',
            field: 'email',
          },
          {
            title: 'Role',
            field: 'role',
            Cell({ entry: { role } }) {
              return <span>{role === 1 ? 'Admin' : 'User'}</span>;
            },
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
              return <UserDetail id={_id} />;
            },
          },
          {
            title: '',
            field: '_id',
            Cell({ entry: { _id } }) {
              return <DeleteUser id={_id} />;
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
