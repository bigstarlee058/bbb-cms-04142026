import { Table, Spinner } from '@/components/Elements';
import { formatDate } from '@/utils/format';
import { User, Filters } from '@/types';
import { fetchUsers } from '../api';
import { useQuery } from 'react-query';
import { DeleteUser } from './DeleteUser';
import { Link } from 'react-router-dom';
import Pagination from '@/components/Elements/Pagination';
import { useEffect, useState } from 'react';
import useDebounce from '@/lib/useDebounce';
import { SearchField } from '@/components/ui/SearchField';

export const UsersList = () => {
  const { data, isLoading, refetch } = useQuery('get-users', () => fetchUsers(filters));
  const [currentPage, setCurrentPage] = useState(1);
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
      </div>
      <Table<User>
        data={data.users}
        columns={[
          {
            title: 'First Name',
            field: 'firstname',
          },
          {
            title: 'Last Name',
            field: 'lastname',
          },
          {
            title: 'Email',
            field: 'email',
          },
          {
            title: 'Role',
            field: 'role',
            Cell({ entry: { role } }) {
              return <span>{role === 2 ? 'Admin' : 'User'}</span>;
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
              return <Link to={`./${_id}`}>View</Link>;
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
