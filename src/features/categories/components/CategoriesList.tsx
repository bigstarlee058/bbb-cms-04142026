import { useQuery } from 'react-query';

import { Table, Spinner, Link } from '@/components/Elements';
import { Category } from '@/types';

import { fetchCategories } from '../api';

import { DeleteCategory } from './DeleteCategory';

export const CategoriesList = () => {
  const { data, isLoading } = useQuery('get-categories', fetchCategories);

  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <Table<Category>
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
          title: 'Exercises Counts',
          field: 'count',
        },
        /*
        {
          title: 'Created At',
          field: 'createdAt',
          Cell({ entry: { createdAt } }) {
            return <span>{formatDate(createdAt)}</span>;
          },
        },
        */
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
            return <DeleteCategory categoryId={_id} />;
          },
        },
      ]}
    />
  );
};
