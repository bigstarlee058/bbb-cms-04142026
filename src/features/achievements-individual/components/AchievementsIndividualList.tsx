import { useEffect, useState } from 'react';
import { Table, Spinner, Link, Button } from '@/components/Elements';
import { useQuery } from 'react-query';
import { fetchAchievements } from '../api';
import { Achievement, Filters } from '@/types';
import { DeleteAchievementsIndividual } from './DeleteAchievementsIndividual';
import { UpdateAchievementsIndividual } from './UpdateAchievementsIndividual';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const AchievementsIndividualList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
  });

  const {
    data: achievementsData,
    isLoading,
    refetch,
  } = useQuery(['get-achievements'], () => fetchAchievements(filters));

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

  if (!achievementsData) return null;

  return (
    <>
      <Table<Achievement>
        data={achievementsData.achievementsIndividuals}
        columns={[
          {
            title: 'Title',
            field: 'title',
          },
          {
            title: 'Thumbnail',
            field: 'image',
            Cell({ entry: { image } }) {
              return (
              <div className="justify-center items-center">
                <img className="h-24 object-contain" src={image} />
              </div>);
            },
          },
          {
            title: 'Type',
            field: 'type',
          },
          {
            title: 'Value',
            field: 'value',
          },
          {
            title: 'Description',
            field: 'description',
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <UpdateAchievementsIndividual achievementId={_id} achievements={achievementsData} />;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteAchievementsIndividual achievementId={_id} />;
            },
          },
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil(achievementsData.count / (filters?.perPage || 10))}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
