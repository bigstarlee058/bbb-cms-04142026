import { useEffect, useState } from 'react';
import { Table, Spinner, Link, Button } from '@/components/Elements';
import { useQuery } from 'react-query';
import { fetchAchievements } from '../api';
import { Achievement, AchievementIndividual, AchievementsGroup, Filters } from '@/types';
import { DeleteAchievementsGroup } from './DeleteAchievementsGroup';
import { UpdateAchievementsGroup } from './UpdateAchievementsGroup';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const AchievementsGroupList = ({titles}) => {
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
  } = useQuery(['get-achievementsgroups'], () => fetchAchievements(filters));

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
      <Table<AchievementsGroup>
        data={achievementsData.achievementsGroups}
        columns={[
          {
            title: 'Title',
            field: 'title',
          },
          {
            title: 'Type',
            field: 'type',
          },
          {
            title: 'Description',
            field: 'description',
          },
          {
            title: 'Achievements',
            field: 'achievements',
            minwidth: 150,
            Cell({ entry: { achievements } }) {
              if (!titles) return null; // Check if titles is defined
              const sortedAchievements = achievements.sort((a, b) => a.index - b.index);
              return (
                <span>
                  {sortedAchievements.map((achievement, idx) => {
                    const matchedTitle = titles.find((title) => title.id === achievement.achievementId);
                    if (!matchedTitle) return null;
                    return (
                      <div key={idx} className='p-1'>
                        <strong>Level {achievement.index + 1}: </strong>  {matchedTitle.title}
                      </div>
                    );
                  })}
                </span>
              );
            }
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <UpdateAchievementsGroup achievementId={_id} achievements={achievementsData} titles = {titles} />;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteAchievementsGroup achievementId={_id} />;
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
