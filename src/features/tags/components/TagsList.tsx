import { useEffect, useState } from 'react';
import { Table } from '@/components/Elements';
import { Tags, Filters } from '@/types';
import { DeleteTag } from './DeleteTag';
import { UpdateTag } from './UpdateTag';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const TagsList = ({
  getValue,
  tagData,
  currentPage,
  setCurrentPage
}: {
  getValue: (item: any, field: string) => any,
  tagData: any,
  currentPage: number,
  setCurrentPage: (page: number) => void
}) => {

  if (!tagData) return null;

  return (
    <>
      <Table<Tags>
        data={tagData.tags}
        columns={[
          {
            title: 'Title',
            field: 'title',
            Cell({ entry }) {
              return <span>{getValue(entry, 'title')}</span>;
            },
          },
          {
            title: 'Exercise Count',
            field: 'exerciseCount',
            width: 200,
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <UpdateTag tagId={_id} tags={tagData} />;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteTag tagId={_id} />;
            },
          },
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil(tagData.count / 10)}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
