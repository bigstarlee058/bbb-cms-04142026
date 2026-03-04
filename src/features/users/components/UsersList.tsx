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
import { fetchLanguages } from '@/lib/api';
export const UsersList = () => {
  const { search, sortBy, subscription, source, language } = useFilteringStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
    search: '',
    filter: {},
    sortBy: undefined,
    subscription:undefined,
    source: undefined,
    language: undefined,
  });

  const { data, isLoading, isFetching, } = useQuery(
    ['get-users', filters],
    () => fetchUsers(filters),
    { keepPreviousData: true }
  );

  useEffect(() => {
    setFilters((prev) => ({ ...prev, language: language?.value, page: 1 }));
    setCurrentPage(1);
  }, [language]);
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search, page: 1, subscription: undefined }));
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, sortBy: sortBy?.value, page: 1 }));
    setCurrentPage(1);
  }, [sortBy]);
  useEffect(() => {
    setFilters((prev) => ({ ...prev, subscription: subscription?.value, page: 1 }));
    setCurrentPage(1);
  }, [subscription]);
  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: currentPage }));
  }, [currentPage]);
  useEffect(() => {
    setFilters((prev) => ({ ...prev, source: source?.value, page: 1 }));
    setCurrentPage(1);
  }, [source]);
  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }
  const ActiveFiltersBar = ({
    totalCount,
    sortBy,
    subscription,
    source,
    language,
    search,
    fetchedLanguages,
  }: {
    totalCount: number;
    sortBy: string | undefined;
    subscription: string | undefined;
    source: string | undefined;
    language: string | undefined;
    search: string | undefined;
    fetchedLanguages: { key: string; name: string }[];
  }) => {
    const getLanguageLabel = (langKey: string) => {
      if (langKey === 'en') return 'English';
      const found = fetchedLanguages.find((l) => l.key === langKey);
      return found?.name || langKey;
    };

    const parts = [
      `${totalCount.toLocaleString()} results`,
      sortBy && `Sort: ${sortBy}`,
      subscription && subscription !== '' && `Sub: ${subscription.charAt(0).toUpperCase() + subscription.slice(1)}`,
      source && source !== '' && `Src: ${source.charAt(0).toUpperCase() + source.slice(1)}`,
      language && language !== '' && `Lang: ${getLanguageLabel(language)}`,
      search && search !== '' && `"${search}"`,
    ].filter(Boolean);

    return (
      <div className="w-full px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
        {parts.join('  ·  ')}
      </div>
    );
  };
  if (!data) return null;

  return (
    <div className="relative">
      {isFetching && (
        <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-50 z-10">
          <Spinner size="lg" />
        </div>
      )}
      <ActiveFiltersBar
        totalCount={data.totalCount}
        sortBy={filters.sortBy}
        subscription={filters.subscription}
        source={filters.source}
        language={filters.language}
        search={filters.search}
        fetchedLanguages={fetchedLanguages}
      />
      <Table<User>
        data={data.users}
        columns={[
          { title: 'Name', field: 'name' },
          { title: 'Email', field: 'email' },
          {
            title: 'Source',
            field: 'singuptype',
            Cell({ entry: { singuptype } }) {
              return <span>{singuptype === "mobile" ? "Mobile" : "Wordpress"}</span>;
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
              const { subscription, rcUserId, _id, name, email } = entry;
              const isActive = subscription?.end_date
                ? new Date(subscription.end_date) > new Date()
                : false;

              const currentType: string = (() => {
                if (!isActive) return 'free';
                const type = (subscription?.subscription_type || '').toLowerCase();
                if (type.includes('trial')) return 'trial';
                if (type.includes('week')) return 'weekly';
                if (type.includes('month')) return 'monthly';
                if (type.includes('quarter')) return 'quarterly';
                if (type.includes('year')) return 'yearly';
                return 'free';
              })();

              const [subscriptionType, setSubscriptionType] = useState<string>(currentType);
              const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

              const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                const newValue = e.target.value as 'current' | 'change';
                if (newValue === 'change') {
                  setShowSubscriptionPopup(true);
                }
                setSubscriptionType(currentType);
              };

              return (
                <>
                  <select
                    value={subscriptionType}
                    onChange={handleChange}
                    className="border rounded p-1"
                  >
                    <option value={currentType}>
                      {currentType.charAt(0).toUpperCase() + currentType.slice(1)}
                    </option>
                    <option value="change">Change</option>
                  </select>

                  {showSubscriptionPopup && (
                    <ManageSubscription
                      id={rcUserId || _id}
                      name={name}
                      email={email}
                      uid={entry.uid}
                      onClose={() => setShowSubscriptionPopup(false)}
                      currentSubscription={{
                        subscription_type: currentType,
                        price: subscription?.price,
                        purchase_date: subscription?.purchase_date,
                        end_date: subscription?.end_date,
                        update_source: subscription?.update_source,
                        update_date: subscription?.update_date,
                      }}
                    />
                  )}
                </>
              );
            },
          },
          {
            title: 'Platform',
            field: '_id',
            Cell({ entry }) {
              const systemName = entry?.deviceInfo?.systemName;
              const osVersion = entry?.deviceInfo?.osVersion;
              if (!systemName) return <div>-</div>;
              return <div>{osVersion ? `${systemName} ${osVersion}` : systemName}</div>;
            },
          },
          {
            title: 'App Version',
            field: '_id',
            Cell({ entry }) {
              return <div>{entry?.deviceInfo?.appVersion || '-'}</div>;
            },
          },
          {
            title: 'Language',
            field: 'settings',
            Cell({ entry }) {
              const langKey = entry.settings?.language || 'en';
              const foundLang = fetchedLanguages.find((l) => l.key === langKey);
              const langName = foundLang?.name || (langKey === 'en' ? 'English' : langKey);
              return <span>{langName}</span>;
            },
          },
          {
            title: '',
            field: '_id',
            Cell({ entry: { _id } }) {
              return (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <UserDetail id={_id} />
                  <DeleteUser id={_id} />
                </div>
              );
            },
          }
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
