import { useEffect, useState } from 'react';
import { Table, Link, Button } from '@/components/Elements';
import { formatDate } from '@/utils/format';
import { Restday, Filters } from '@/types';
import { DeleteRestday } from './DeleteRestday';
import { EyeIcon } from '@heroicons/react/outline';
import { UpdateRestday } from './UpdateRestday';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const RestdayList = ({
  getValue,
  restdayData,
  titles,
}: {
  getValue: (item: any, field: string) => any;
  restdayData: any;
  titles: any;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const perPage = 10;

  if (!restdayData) return null;

  const total = restdayData.restdays?.length || 0;
  const lastPage = Math.ceil(total / perPage);
  const paginatedRestdays = restdayData.restdays?.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <>
      <Table<Restday>
        data={paginatedRestdays}
        columns={[
          {
            title: 'Title',
            field: 'title',
            Cell({ entry }) {
              return <span>{getValue(entry, 'title')}</span>;
            },
          },
          {
            title: 'Vimeo',
            field: 'vimeoId',
            Cell({entry}){
              return <span>{getValue(entry, 'vimeoId')}</span>;
            }
          },
          {
            title: 'Note',
            field: 'description',
            Cell({ entry }) {
              return <span>{getValue(entry, 'description')}</span>;
            },
          },
          {
            title: 'Equipment',
            field: 'equipments',
            Cell({ entry: { equipments } }) {
              if (!titles) return null;
              const filteredTitles = titles
                .filter((title) => equipments.includes(title.id))
                .map((title) => title.title)
                .join(', ');
              return <span>{filteredTitles}</span>;
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
              return <UpdateRestday restdayId={_id} restdays={restdayData} titles={titles} />;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteRestday restdayId={_id} />;
            },
          },
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