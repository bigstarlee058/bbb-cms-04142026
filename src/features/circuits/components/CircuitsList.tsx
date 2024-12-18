import { useEffect, useState } from 'react';
import { Table, Spinner, Link, Button } from '@/components/Elements';
import { useQuery } from 'react-query';
import { fetchCircuits } from '../api';
import { Filters, Circuit } from '@/types';
import { EyeIcon } from '@heroicons/react/outline';
import { DeleteCircuit } from './DeleteCircuit';
import { UpdateCircuit } from './UpdateCircuit';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const CircuitsList = ({ titles = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1
  });

  const { data: circuitData, isLoading, refetch } = useQuery(['get-circuits'], () => fetchCircuits(filters));

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

  const getExercise = (exerciseId: string) => {
    return titles?.find((exercise) => exercise._id === exerciseId);
  };

  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!circuitData) return null;

  return (
    <>
      <Table<Circuit>
        data={circuitData.circuits}
        columns={[
          {
            title: 'Title',
            field: 'title'
          },
          {
            title: 'Exercises',
            field: 'exercises',
            Cell({ entry: { exercises } }) {
              return (
                <div className="flex flex-col">
                  {exercises.map((exercise, index) => (
                    <span key={index}>{getExercise(exercise.exerciseId)?.title}</span>
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
              return <UpdateCircuit titles={titles} circuitId={_id} circuits={circuitData} />;
            }
          },
          {
            title: '',
            field: '_id',
            Cell({ entry: { _id } }) {
              return <DeleteCircuit circuitId={_id} />;
            }
          }
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil(circuitData.count / (filters?.perPage || 10))}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
