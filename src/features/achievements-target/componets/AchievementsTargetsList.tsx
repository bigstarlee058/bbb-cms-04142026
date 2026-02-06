import { useEffect, useState } from 'react';
import { Table } from '@/components/Elements';
import { Target } from '@/types';
import { DeleteAchievementsTarget } from './DeleteAchievementsTarget';
import { UpdateAchievementsTarget } from './UpdateAchievementsTarget';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const AchievementsTargetsList = ({
  getValue,
  targetData,
}: {
  getValue: (item: any, field: string) => any;
  targetData: any;
}) => {
  const perPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const { search } = useFilteringStore();

  if (!targetData) return null;
  let filteredData = targetData.achievementsTargets || [];
  if (search) {
    filteredData = filteredData.filter((item: any) => {
      const title = getValue(item, 'title')?.toLowerCase() || '';
      return title.includes(search.toLowerCase());
    });
  }

  const total = filteredData.length;
  const lastPage = Math.ceil(total / perPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <>
      <Table<Target>
        data={paginatedData}
        columns={[
          {
            title: 'Title',
            field: 'title',
            Cell({ entry }) {
              return <span>{getValue(entry, 'title')}</span>;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <UpdateAchievementsTarget targetId={_id} targets={targetData} />;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteAchievementsTarget targetId={_id} />;
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
