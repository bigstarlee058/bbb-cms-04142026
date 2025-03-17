import { useEffect, useState } from 'react';
import { Table, Spinner, Link, Button } from '@/components/Elements';
import { useQuery } from 'react-query';
import { fetchChallenges } from '../api';
import { Filters, Challenge } from '@/types';
import { EyeIcon } from '@heroicons/react/outline';
import { DeleteChallenge } from './DeleteChallenge';
import { UpdateChallenge } from './UpdateChallenge';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const ChallengesList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
  });

  const {
    data: challengeData,
    isLoading,
    refetch,
  } = useQuery(['get-challenges'], () => fetchChallenges(filters));

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

  if (!challengeData) return null;

  return (
    <>
      <Table<Challenge>
        data={challengeData.challenges}
        columns={[
          {
            title: 'Title',
            field: 'title',
          },
          {
            title: 'Photo',
            field: 'photo',
            Cell({ entry: { photo } }) {
              return (
              <div className="justify-center items-center">
                <img className="h-24 object-contain" src={photo} />
              </div>);
            },
          },
          {
            title: 'Description',
            field: 'description',
            Cell({ entry: { description } }) {
              return <p>{description.length > 100 ? `${description.slice(0, 100)}...` : description}</p>;
            }
          },
          {
            title: 'Button Text',
            field: 'buttonText',
          },
          {
            title: 'Link',
            field: 'link',
          },
          {
            title: 'Featured',
            field: 'isFeatured',
            Cell({ entry: { isFeatured } }) {
              return (
              <div className="justify-center items-center">
                {isFeatured ? "Featured" : ""}
              </div>);
            },
          },
          {
            title: 'Hide',
            field: 'isHide',
            Cell({ entry: { isHide } }) {
              return (
              <div className="justify-center items-center">
                {isHide ? "Hiden" : "Show"}
              </div>);
            },
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
            },
          },
          {
            title: '',
            field: '_id',
            Cell({ entry: { _id } }) {
              return <UpdateChallenge challengeId={_id} challenges={challengeData} />;
            },
          },
          {
            title: '',
            field: '_id',
            Cell({ entry: { _id } }) {
              return <DeleteChallenge challengeId={_id} />;
            },
          },
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil(challengeData.count / (filters?.perPage || 10))}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
