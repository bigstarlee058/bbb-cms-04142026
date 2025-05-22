import { useEffect, useState } from 'react';
import { Table, Spinner, Link, Button } from '@/components/Elements';
import { useQuery } from 'react-query';
import { fetchSections } from '../api';
import { Section, Filters } from '@/types';
import { EyeIcon } from '@heroicons/react/outline';
import { DeleteSection } from './DeleteSection';
import { UpdateSection } from './UpdateSection';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const SectionsList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
  });

  const {
    data: sectionData,
    isLoading,
    refetch,
  } = useQuery(['get-sections'], () => fetchSections(filters));

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

  if (!sectionData) return null;

  return (
    <>
      <Table<Section>
        data={sectionData.sections}
        columns={[
          {
            title: 'Title',
            field: 'title',
          },
          {
            title: 'Description',
            field: 'description',
          },
          {
            title: 'Vimeo Id',
            field: 'vimeoId',
            minwidth: 100,
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
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil(sectionData.count / (filters?.perPage || 10))}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
