import { Table, Link, Button } from '@/components/Elements';
import { formatDate } from '@/utils/format';
import { Bonus } from '@/types';
import { DeleteBonus } from './DeleteBonus';
import { EyeIcon } from '@heroicons/react/outline';
import { UpdateBonus } from './UpdateBonus';
import Pagination from '@/components/Elements/Pagination';

type BonusesListProps = {
  getValue: (item: any, field: string) => any;
  bonusData: any;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  perPage: number;
};

export const BonusesList = ({
  getValue,
  bonusData,
  currentPage,
  setCurrentPage,
  perPage,
}: BonusesListProps) => {
  if (!bonusData?.bonuses) {
    return <>No Data Found</>;
  }

  const lastPage = Math.ceil((bonusData?.count || 0) / perPage);

  return (
    <>
      <Table<Bonus>
        data={bonusData.bonuses}
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
            Cell({ entry: { thumbnail } }) {
              return (
                <div className="justify-center items-center">
                  <img className="h-24 object-contain" src={thumbnail} />
                </div>
              );
            },
          },
          {
            title: 'Description',
            field: 'description',
            Cell({ entry }) {
              const description = getValue(entry, 'description') || '';
              return (
                <p>
                  {description.length > 100
                    ? `${description.slice(0, 100)}...`
                    : description}
                </p>
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
            title: 'Featured',
            field: 'isFeatured',
            Cell({ entry: { isFeatured } }) {
              return (
                <div className="justify-center items-center">
                  {isFeatured ? 'Featured' : ''}
                </div>
              );
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return (
                <Link to={`./${_id}`}>
                  <Button
                    variant="danger"
                    startIcon={<EyeIcon className="h-4 w-4" />}
                  />
                </Link>
              );
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <UpdateBonus bonusId={_id} bonuses={bonusData} />;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteBonus bonusId={_id} />;
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
