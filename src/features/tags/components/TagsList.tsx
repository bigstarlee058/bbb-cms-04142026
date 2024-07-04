import { Table, Spinner, Link, ConfirmationDialog } from '@/components/Elements';
import { formatDate } from '@/utils/format';
import { useQuery } from 'react-query';
import { fetchTags } from '../api';
import { Tag } from '@/types';
import { DeleteTag } from './DeleteTag';

export const TagsList = () => {
  const { data, isLoading, refetch } = useQuery('get-tags', fetchTags);

  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <Table<Tag>
      data={data}
      columns={[
        {
          title: 'Tag Name',
          field: 'name',
        },
        {
          title: 'Created At',
          field: 'createdAt',
          Cell({ entry: { createdAt } }) {
            return <span>{formatDate(createdAt)}</span>;
          },
        },
        {
          title: 'Collections',
          field: 'featuredCollections',
          Cell({ entry: { featuredCollections } }) {
            return <span>{featuredCollections.length}</span>;
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
            return <DeleteTag tagId={_id} />;
          },
        },
      ]}
    />
  );
};
