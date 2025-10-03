import { Table, Spinner } from '@/components/Elements';
import { formatDate } from '@/utils/format';
import { User, Filters } from '@/types';
import { fetchUsers } from '../api';
import { useQuery } from 'react-query';
import { DeleteUser } from './DeleteUser';
import Pagination from '@/components/Elements/Pagination';
import { useEffect, useState } from 'react';
import { useFilteringStore } from '@/stores/filter';
import { UserDetail } from '../UserDetail';
import { ManageSubscription } from './ManageSubscription';
export const UsersList = () => {
  const { search, sortBy } = useFilteringStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
    search: '',
    filter: {},
    sortBy: undefined,
  });

  const { data, isLoading, isFetching, } = useQuery(
    ['get-users', filters],
    () => fetchUsers(filters),
    { keepPreviousData: true }
  );


  useEffect(() => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, sortBy: sortBy?.value, page: 1 }));
    setCurrentPage(1);
  }, [sortBy]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: currentPage }));
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
    <div className="relative">
      {isFetching && (
        <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-50 z-10">
          <Spinner size="lg" />
        </div>
      )}

      <Table<User>
        data={data.users}
        columns={[
          { title: 'Name', field: 'name' },
          { title: 'Email', field: 'email' },
          {
            title: 'Register Type',
            field: 'uid',
            Cell({ entry: { uid } }) {
              return <span>{uid == '-1' ? 'Mobile' : 'Wordpress'}</span>;
            },
          },
          {
            title: 'Tier',
            field: 'subscription',
            Cell({ entry: { subscription } }) {
              return (
                <span>
                  {subscription?.user_subscription_status === 'free_user'
                    ? 'Free'
                    : new Date(subscription?.end_date) > new Date()
                    ? 'Paid'
                    : 'Free'}
                </span>
              );
            },
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
            title: 'Subscription',
            field: 'subscription',
            Cell({ entry }) {
              const { subscription, _id, name, email } = entry;
              const currentType: 'free' | 'monthly' | 'yearly' = (() => {
                const type = subscription?.subscription_type || '';
                if (type.toLowerCase().includes('month')) return 'monthly';
                if (type.toLowerCase().includes('year')) return 'yearly';
                return 'free';
              })();

              const [subscriptionType, setSubscriptionType] = useState(currentType);
              const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

              const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                const newValue = e.target.value as 'free' | 'monthly' | 'yearly';
                setSubscriptionType(newValue);
                if (newValue !== currentType) {
                  setShowSubscriptionPopup(true);
                }
              };

              return (
                <>
                  <select
                    value={subscriptionType}
                    onChange={handleChange}
                    className="border rounded p-1"
                  >
                    <option value="free">Free</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>

                  {showSubscriptionPopup && (
                    <ManageSubscription
                      id={_id}
                      name={name}
                      email={email}
                      onClose={() => {
                        setShowSubscriptionPopup(false);
                        setSubscriptionType(currentType);
                      }}
                      currentSubscription={{
                        subscription_type: currentType,
                        price: subscription?.price,
                        purchase_date: subscription?.purchase_date,
                        end_date: subscription?.end_date,
                      }}
                    />
                  )}
                </>
              );
            },
          }
          ,
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
          lastPage={Math.ceil(data.totalCount / (filters.perPage || 10))}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};
