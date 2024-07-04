import { Table, Spinner, Link } from '@/components/Elements';
import { formatDate } from '@/utils/format';
import { useQuery } from 'react-query';
import { fetchAllCollections } from '../api';
import { Collection } from '@/types';
import { DeleteCollection } from './DeleteCollection';

export const CollectionsList = () => {
  const { data, isLoading } = useQuery('get-collections', fetchAllCollections);

  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <Table<Collection>
      data={data}
      columns={[
        {
          title: 'Title',
          field: 'title',
        },
        {
          title: 'Thumbnail',
          field: 'thumbnail',
          Cell({ entry: { thumbnail } }) {
            return <img className="w-24" src={thumbnail} alt="Thumbnail" />;
          },
        },
        {
          title: 'Tags',
          field: 'tags',
          Cell({ entry: { tags } }) {
            return <span>{tags.length}</span>;
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
            return <DeleteCollection collectionId={_id} />;
          },
        },
      ]}
    />
  );
};
