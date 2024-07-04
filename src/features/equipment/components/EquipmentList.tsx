import { Table, Spinner, Link, ConfirmationDialog } from '@/components/Elements';
import { formatDate } from '@/utils/format';
import { useQuery } from 'react-query';
import { fetchEquipments } from '../api';
import { Equipment } from '@/types';
import { DeleteEquipment } from './DeleteEquipment';

export const EquipmentList = () => {
  const { data, isLoading } = useQuery('get-equipments', fetchEquipments);

  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <Table<Equipment>
      data={data}
      columns={[
        {
          title: 'Title',
          field: 'title',
        },
        {
          title: 'Price',
          field: 'price',
        },
        {
          title: 'Thumbnail',
          field: 'thumbnail',
          Cell({ entry: { thumbnail } }) {
            return <img className="w-24" src={thumbnail} />;
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
          title: 'Product',
          field: 'link',
          Cell({ entry: { link } }) {
            return (
              <a href={link} target="_blank">
                Visit Product
              </a>
            );
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
            return <DeleteEquipment equipmentId={_id} />;
          },
        },
      ]}
    />
  );
};
