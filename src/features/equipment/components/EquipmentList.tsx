import { useEffect, useState } from 'react';
import { Table, Spinner, Link, Button } from '@/components/Elements';
import { formatDate } from '@/utils/format';
import { useQuery } from 'react-query';
import { fetchEquipments } from '../api';
import { Equipment, Filters } from '@/types';
import { DeleteEquipment } from './DeleteEquipment';
import { EyeIcon } from '@heroicons/react/outline';
import { UpdateEquipment } from './UpdateEquipment';
import { useFilteringStore } from '@/stores/filter';
import { fetchCollectionTitles } from '@/features/workouts/api';
import Pagination from '@/components/Elements/Pagination';

export const EquipmentList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
  });

  const {
    data: equipmentData,
    isLoading,
    refetch,
  } = useQuery(['get-equipments'], () => fetchEquipments(filters));

  const { data: titles } = useQuery('get-collection-titles', () =>
    fetchCollectionTitles({ filterString: '' })
  );
  useEffect(() => {
    refetch();
  }, [filters]);

  useEffect(() => {
    setFilters({
      ...filters,
      page: currentPage,
    });
  }, [currentPage]);

  useEffect(() => {
    setFilters((p) => ({ ...p, search: search }));
  }, [search]);

  useEffect(() => {
    setFilters({
      ...filters,
      sortBy: sortBy?.value,
    });
  }, [sortBy]);

  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!equipmentData) return null;
  return (
    <>
      <Table<Equipment>
        data={equipmentData.equipments}
        columns={[
          {
            title: 'Title',
            field: 'title',
          },
          {
            title: 'Thumbnail',
            field: 'thumbnail',
            Cell({ entry: { thumbnail } }) {
              return (
              <div className="justify-center items-center">
                <img className="h-24 object-contain" src={thumbnail} />
              </div>);
            },
          },
          {
            title: 'Description',
            field: 'description',

            Cell({ entry: { description } }) {
              return (
                <span
                  dangerouslySetInnerHTML={{
                    __html: description.length > 100 ? `${description.slice(0, 100)}...` : description,
                  }}
                />
              );
              // return <p>{description.length > 100 ? `${description.slice(0, 100)}...` : description}</p>;
            }
          },
          {
            title: 'URL',
            field: 'link',
            Cell({ entry: { link } }) {
              return (
                <a href={link} target="_blank">
                  {link}
                </a>
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
              return <UpdateEquipment equipmentId={_id} equipments={equipmentData} titles={titles} />;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteEquipment equipmentId={_id} />;
            },
          },
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil(equipmentData.count / (filters?.perPage || 10))}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
