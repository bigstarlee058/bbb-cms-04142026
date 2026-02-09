import { useEffect, useState } from 'react';
import { Table, Link, Button } from '@/components/Elements';
import { formatDate } from '@/utils/format';
import { Collection, Filters } from '@/types';
import { DeleteCollection } from './DeleteCollection';
import { EyeIcon } from '@heroicons/react/outline';
import { UpdateCollection } from './UpdateCollection';
import Pagination from '@/components/Elements/Pagination';

export const CollectionsList = ({
  getValue,
  collectionData,
}: {
  getValue: (item: any, field: string) => any;
  collectionData: any;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  if (!collectionData?.collections) return <>No Data Found</>;

  return (
    <>
      <Table<Collection>
        data={collectionData.collections}
        columns={[
          {
            title: 'Title',
            field: 'title',
            Cell({ entry }) {
              return <span>{getValue(entry, 'title')}</span>;
            },
          },
          {
            title: 'Thumbnail',
            field: 'thumbnail',
            Cell({ entry }) {
              return (
                <div className="justify-center items-center">
                  <img className="h-24 object-contain" src={getValue(entry, 'thumbnail')} />
                </div>);
            },
          },
          {
            title: 'Description',
            field: 'description',
            Cell({ entry }) {
              const description = getValue(entry, 'description') || '';
              return <p>{description.length > 100 ? `${description.slice(0, 100)}...` : description}</p>;
            }
          },
          {
            title: 'Created On',
            field: 'createdAt',
            Cell({ entry: { createdAt } }) {
              return <span>{formatDate(createdAt)}</span>;
            },
          },
          {
            title: 'Featured',
            field: 'isFeatured',
            Cell({ entry: { isFeatured } }) {
              return (
                <div className="justify-center items-center">
                  {isFeatured ? "Featured" : ""}
                </div>);
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
              return <UpdateCollection collectionId={_id} collections={collectionData} />;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteCollection collectionId={_id} />;
            },
          },
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil((collectionData?.count || 0) / perPage)}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
