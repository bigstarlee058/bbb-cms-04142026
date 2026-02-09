import { useEffect, useState } from 'react';
import { Table, Spinner, Link, Button } from '@/components/Elements';
import { useQuery } from 'react-query';
import { fetchSections } from '../api';
import { Section, Filters, Phases } from '@/types';
import { EyeIcon } from '@heroicons/react/outline';
import { DeleteSection } from './DeleteSection';
import { UpdateSection } from './UpdateSection';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';
export const SectionsList = ({
  getValue,
  sectionData,
}: {
  getValue: (item: any, field: string) => any;
  sectionData: any;
}) => {
  const perPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const { search } = useFilteringStore();

  if (!sectionData) return null;
  let filteredData = sectionData.phases || [];
  if (search) {
    filteredData = filteredData.filter((item: any) => {
      const title = getValue(item, 'title')?.toLowerCase() || '';
      const description = getValue(item, 'description')?.toLowerCase() || '';
      const searchTerm = search.toLowerCase();
      return title.includes(searchTerm) || description.includes(searchTerm);
    });
  }

  const total = filteredData.length;
  const lastPage = Math.ceil(total / perPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);


  if (!sectionData) return null;

  return (
    <>
      <Table<Phases>
        data={sectionData.phases}
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
                </div>);
            },
          },
          {
            title: 'Description',
            field: 'description',
            Cell({ entry }) {
              return <span>{getValue(entry, 'description')}</span>;
            },
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
