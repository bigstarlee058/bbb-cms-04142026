import { useState } from 'react';
import { Table } from '@/components/Elements';
import { Section } from '@/types';
import { DeleteSection } from './DeleteSection';
import { UpdateSection } from './UpdateSection';
import Pagination from '@/components/Elements/Pagination';

export const SectionsList = ({
  getValue,
  sectionData,
  currentPage,
  setCurrentPage,
  perPage,
}: {
  getValue: (item: any, field: string) => any;
  sectionData: any;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  perPage: number;
}) => {
  if (!sectionData?.sections) return (<>No Data Found</>);

  const lastPage = Math.ceil((sectionData?.count || 0) / perPage);

  return (
    <>
      <Table<Section>
        data={sectionData.sections}
        columns={[
          {
            title: 'Title',
            field: 'title',
            minwidth: 80,
            Cell({ entry }) {
              return <span>{getValue(entry, 'title')}</span>;
            },
          },
          {
            title: 'Description',
            field: 'description',
            Cell({ entry }) {
              const description = getValue(entry, 'description') || '';
              return (
                <span
                  dangerouslySetInnerHTML={{
                    __html: description.length > 100 ? `${description.slice(0, 100)}...` : description,
                  }}
                />
              );
            }
          },
          {
            title: 'Vimeo Id',
            field: 'vimeoId',
            minwidth: 100,
            Cell({ entry }) {
              return <span>{getValue(entry, 'vimeoId')}</span>;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <UpdateSection sectionId={_id} sections={sectionData} />;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteSection sectionId={_id} />;
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
