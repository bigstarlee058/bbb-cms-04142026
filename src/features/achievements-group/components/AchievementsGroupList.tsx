import { useState } from 'react';
import { Table } from '@/components/Elements';
import { AchievementsGroup } from '@/types';
import { DeleteAchievementsGroup } from './DeleteAchievementsGroup';
import { UpdateAchievementsGroup } from './UpdateAchievementsGroup';
import Pagination from '@/components/Elements/Pagination';

export const AchievementsGroupList = ({
  getValue,
  achievementsData,
  titles,
}: {
  getValue: (item: any, field: string) => any;
  achievementsData: any;
  titles: any;
}) => {
  const perPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  if (!achievementsData) return null;

  const total = achievementsData?.achievementsGroups?.length || 0;
  const lastPage = Math.ceil(total / perPage);
  const paginatedData = achievementsData?.achievementsGroups?.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  ) || [];

  return (
    <>
      <Table<AchievementsGroup>
        data={paginatedData}
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
            title: 'Type',
            field: 'type',
          },
          {
            title: 'Description',
            field: 'description',
            Cell({ entry }) {
              return <span>{getValue(entry, 'description')}</span>;
            },
          },
          {
            title: 'Achievements',
            field: 'achievements',
            minwidth: 150,
            Cell({ entry: { achievements } }) {
              
              if (!titles) return null;
              const sortedAchievements = achievements.sort((a, b) => a.index - b.index);
              return (
                <span>
                  {sortedAchievements.map((achievement, idx) => {
                    const matchedTitle = titles.find((title) => title._id === achievement.achievementId);
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
              return <UpdateAchievementsGroup achievementId={_id} achievements={achievementsData} titles={titles} />;
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