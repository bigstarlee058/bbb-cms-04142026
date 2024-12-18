import { useEffect, useState } from 'react';
import { Table, Spinner, Link, Button } from '@/components/Elements';
import { useQuery } from 'react-query';
import { fetchPumpDays } from '../api';
import { Filters, PumpDay } from '@/types';
import { EyeIcon } from '@heroicons/react/outline';
import { DeletePumpDay } from './DeletePumpDay';
import { UpdatePumpDay } from './UpdatePumpDay';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const PumpDaysList = ({ titles }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1
  });

  const { data: pumpDayData, isLoading, refetch } = useQuery(['get-pump-days'], () => fetchPumpDays(filters));

  useEffect(() => {
    refetch();
  }, [filters]);

  useEffect(() => {
    setFilters({
      ...filters,
      page: currentPage
    });
  }, [currentPage]);

  useEffect(() => {
    setFilters((p) => ({ ...p, search: search }));
  }, [search]);

  useEffect(() => {
    setFilters({
      ...filters,
      sortBy: sortBy?.value
    });
  }, [sortBy]);

  const getCircuit = (circuitId: string) => {
    const circuit = titles?.find((circuit) => circuit._id === circuitId);
    return { label: circuit?.title || '', value: circuitId };
  }

  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!pumpDayData) return null;

  return (
    <>
      <Table<PumpDay>
        data={pumpDayData.pumpDays}
        columns={[
          {
            title: 'Title',
            field: 'title'
          },
          {
            title: 'Description',
            field: 'description'
          },
          {
            title: 'Vimeo Id',
            field: 'vimeoId'
          },
          {
            title: 'Circuits',
            field: 'circuits',
            Cell({ entry: { circuits } }) {
              return (
                <div className="flex flex-col">
                  {circuits.map((circuit, index) => (
                    <span key={index}>{getCircuit(circuit.circuitId)?.label}</span>
                  ))}
                </div>
              );
            }
          },
          {
            title: '',
            field: '_id',
            Cell({ entry: { _id } }) {
              return (
                <Link to={`./${_id}`}>
                  <Button variant="danger" startIcon={<EyeIcon className="h-4 w-4" />} />
                </Link>
              );
            }
          },
          {
            title: '',
            field: '_id',
            Cell({ entry: { _id } }) {
              return <UpdatePumpDay pumpDayId={_id} pumpDays={pumpDayData} titles={titles} />;
            }
          },
          {
            title: '',
            field: '_id',
            Cell({ entry: { _id } }) {
              return <DeletePumpDay pumpDayId={_id} />;
            }
          }
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil(pumpDayData.count / (filters?.perPage || 10))}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
