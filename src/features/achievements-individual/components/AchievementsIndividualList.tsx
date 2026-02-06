import { useEffect, useState } from 'react';
import { Table } from '@/components/Elements';
import { AchievementIndividual } from '@/types';
import { DeleteAchievementsIndividual } from './DeleteAchievementsIndividual';
import { UpdateAchievementsIndividual } from './UpdateAchievementsIndividual';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const AchievementsIndividualList = ({
  getValue,
  achievementsData,
  tagtitles,
  othertitles
}: {
  getValue: (item: any, field: string) => any;
  achievementsData: any;
  tagtitles: any;
  othertitles: any;
}) => {
  const perPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const { search } = useFilteringStore();
  if (!achievementsData) return null;
  let filteredData = achievementsData.achievementsIndividuals || [];

  if (search) {
    filteredData = filteredData.filter((item: any) => {
      const title = getValue(item, 'title')?.toLowerCase() || '';
      const description = getValue(item, 'description')?.toLowerCase() || '';
      return title.includes(search.toLowerCase()) || description.includes(search.toLowerCase());
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

  return (
    <>
      <Table<AchievementIndividual>
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
            field: 'image',
            Cell({ entry: { image } }) {
              return (
                <div className="justify-center items-center">
                  <img className="h-24 object-contain" src={image} />
                </div>
              );
            },
          },
          {
            title: 'Target Type',
            field: 'targettype',
          },
          {
            title: 'Target',
            field: 'target',
            Cell({ entry: { target, targettype } }) {
              let filteredTitles = "";
              if (targettype == "Tags") {
                if (!tagtitles || !target) return null;
                filteredTitles = tagtitles
                  .filter((title) => {
                    const titleId = title.id || title._id;
                    return Array.isArray(target) ? target.includes(titleId) : target === titleId;
                  })
                  .map((title) => title.title)
                  .join(', ');
              } else if (targettype == "Others") {
                if (!othertitles || !target) return null;
                filteredTitles = othertitles
                  .filter((title) => {
                    const titleId = title.id || title._id;
                    return Array.isArray(target) ? target.includes(titleId) : target === titleId;
                  })
                  .map((title) => title.title)
                  .join(', ');
              }
              return <span>{filteredTitles}</span>;
            }
          },
          {
            title: 'Value',
            field: 'value',
            Cell({ entry: { value } }) {
              return <span>{Number(value).toLocaleString()}</span>;
            }
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
              return (
                <UpdateAchievementsIndividual
                  achievementId={_id}
                  achievements={achievementsData}
                  tagtitles={tagtitles}
                  othertitles={othertitles}
                />
              );
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