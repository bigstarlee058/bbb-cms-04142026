import { useState } from 'react';

import { DeleteUpsell } from './DeleteUpsell';
import { Table, Spinner } from '@/components/Elements';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { formatDate } from '@/utils/format';
import { Upsell } from '../types';
import { upsellApi } from '../api';
import Pagination from '@/components/Elements/Pagination';
import { useNotificationStore } from '@/stores/notifications';
import { UpdateUpsell } from './UpdateUpsell';
import { UpsellDetail } from './UpsellDetail';

export const UpsellsList = ({ getValue }: { getValue: (item: any, field: string) => any }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();
  const { data: upsellsData, isLoading } = useQuery(['upsells'], upsellApi.getAll);

  const toggleMutation = useMutation(
    ({ id, isActive }: { id: string; isActive: boolean }) => upsellApi.toggleActive(id, isActive),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('upsells');
        addNotification({
          type: 'success',
          title: 'Status updated successfully',
        });
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: error?.message || 'Failed to update status',
        });
      },
    }
  );
  const handleToggleActive = (id: string, currentActive: boolean) => {
    toggleMutation.mutate({ id, isActive: !currentActive });
  };

  const calculateFinalPrice = (originalPrice: number, discountType: string, discountValue: number) => {
    const original = Number(originalPrice) || 0;
    const discount = Number(discountValue) || 0;

    if (discountType === 'percent') {
      return Math.max(0, original - (original * discount) / 100);
    }
    return Math.max(0, original - discount);
  };

  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!upsellsData?.data) return null;

  const total = upsellsData.data.length;
  const lastPage = Math.ceil(total / perPage);
  const paginatedUpsells = upsellsData.data.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  if (total === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No upsells found. Create a new upsell</p>
      </div>
    );
  }

  return (
    <>
      <Table<Upsell>
        data={paginatedUpsells}
        columns={[
          {
            title: 'Image',
            field: 'image',
            width: 60,
            Cell({ entry }) {
              return (
                <img
                  src={getValue(entry, 'image')}
                  alt={getValue(entry, 'title')}
                  className="w-12 h-12 object-cover rounded"
                />
              );
            },
          },
          {
            title: 'Title',
            field: 'title',
            minwidth: 120,
            maxwidth: 150,
            Cell({ entry }) {
              return (
                <div>
                  <div className="text-gray-900">{getValue(entry,"title")}</div>
                  {entry?.subtitle && (
                    <div className=" text-gray-500">{getValue(entry,"subtitle")}</div>
                  )}
                </div>
              );
            },
          },
          {
            title: 'Price',
            field: 'originalPrice',
            width: 80,
            Cell({ entry: { originalPrice, discountType, discountValue, currency } }) {
              const original = Number(originalPrice) || 0;
              const discount = Number(discountValue) || 0;
              const curr = currency || 'USD';
              const finalPrice = calculateFinalPrice(original, discountType, discount);
              return (
                <div className="grid grid-rows-3 gap-1 whitespace-nowrap">
                  <span className="text-gray-500 line-through">
                    {curr} {original.toFixed(2)}
                  </span>

                  {discount > 0 && (
                    <span className="text-bbb">
                      -{discountType === 'percent'
                        ? `${discount}%`
                        : `${curr} ${discount.toFixed(2)}`}
                    </span>
                  )}
                  <span className="text-bbb">
                    {curr} {finalPrice.toFixed(2)}
                  </span>
                </div>
              );

            },
          },
          {
            title: 'Timing',
            field: 'timeType',
            width: 90,
            Cell({ entry: { timeType } }) {
              const labels: Record<string, string> = {
                always: 'Always',
                date_range: 'Date Range',
                duration: 'Duration',
              };
              return (
                <span >
                  {labels[timeType] || timeType}
                </span>
              );
            },
          }, {
            title: 'Dismiss',
            field: 'dismissBehavior',
            width: 100,
            Cell({ entry: { dismissBehavior } }) {
              const labels: Record<string, { text: string; }> = {
                session: { text: 'This Session' },
                days_30: { text: '30 Days' },
                never: { text: 'Forever' },
              };
              const config = labels[dismissBehavior] || labels.session;
              return (
                <span >
                  {config.text}
                </span>
              );
            },
          },
          {
            title: 'Target',
            field: 'targetType',
            width: 100,
            Cell({ entry: { targetType } }) {
              return (
                <span >
                  {targetType === 'all' ? 'All Users' : 'By Criteria'}
                </span>
              );
            },
          },
          {
            title: 'Active',
            field: 'isActive',
            Cell({ entry }) {
              return (
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={entry.isActive}
                    onChange={() => handleToggleActive(entry._id, entry.isActive)}
                  />
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors ${entry.isActive ? 'bg-bbb' : 'bg-gray-300'
                      }`}
                  >
                    <span
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${entry.isActive ? 'translate-x-5' : ''
                        }`}
                    />
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${entry.isActive ? 'text-bbb' : 'text-gray-500'
                      }`}
                  >
                    {entry.isActive ? 'Yes' : 'No'}
                  </span>
                </label>
              );
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
            title: 'Actions',
            field: '_id',
            Cell({ entry }) {
              return (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <UpsellDetail upsell={entry} />
                  <UpdateUpsell upsellId={entry._id} upsells={upsellsData} />
                  <DeleteUpsell id={entry._id} />
                </div>
              );
            },

          }
        ]}
      />

      {lastPage > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage}
            lastPage={lastPage}
            maxLength={7}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}

    </>
  );
};