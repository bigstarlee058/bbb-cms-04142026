import { Table,  Link, Button } from '@/components/Elements';
import { Exercise,  } from '@/types';
import { DeleteExercise } from './DeleteExercise';
import { EyeIcon } from '@heroicons/react/solid';
import { UpdateExercise } from './UpdateExercise';
import Pagination from '@/components/Elements/Pagination';
export const ExercisesList = ({
  getValue,
  exercises,
  currentPage,
  setCurrentPage,
  exerciseTitles,
  equipmentTitles,
  categoryTitles,
  tagTitles,
  refetchCategoryTitles,
  refetchTagTitles
}: {
  getValue: (item: any, field: string) => any,
  exercises: any,
  currentPage: number,
  setCurrentPage: (page: number) => void,
  exerciseTitles: any,
  equipmentTitles: any,
  categoryTitles: any,
  tagTitles: any,
  refetchCategoryTitles: () => void,
  refetchTagTitles: () => void
}) => {


  if (!exercises) return null;

  return (
    <>
      <Table<Exercise>
        data={exercises.exercises}
        columns={[
          {
            title: 'Title',
            field: 'title',
            Cell({ entry }) {
              return getValue(entry, 'title')
            }
          },
          {
            title: 'Thumbnail',
            field: 'thumbnail',
            Cell({ entry }) {
              return (
                <div className="justify-center items-center">
                  <img className="h-24 object-contain" src={getValue(entry, 'thumbnail')} />
                </div>
              );
            }
          },
          {
            title: 'Video Thumbnail',
            field: 'videoThumbnail',
            Cell({ entry }) {
              return (
                <div className="justify-center items-center">
                  <img className="h-24 object-contain" src={getValue(entry, 'videoThumbnail')} />
                </div>
              );
            }
          },
          {
            title: 'Description',
            field: 'description',
            Cell({ entry }) {
              const description = getValue(entry, 'description');
              return (
                <span
                  dangerouslySetInnerHTML={{
                    __html: description.length > 100 ? `${description.slice(0, 100)}...` : description,
                  }}
                />
              );
            }
          },
          {
            title: 'Categories',
            field: 'categories',
            minwidth: 150,
            Cell({ entry: { categories } }) {
              if (!categoryTitles) return null; // Check if titles is defined
              const filteredTitles = categoryTitles
                .filter((title) => categories.includes(title.id))
                .map((title) => title.title)
                .join(', ');
              return <span>{filteredTitles}</span>;
            }
          },
          {
            title: 'Tags',
            field: 'tags',
            minwidth: 150,
            Cell({ entry: { tags } }) {
              if (!tagTitles) return null;
              if (!tags) return null; // Check if titles is defined
              const filteredTitles = tagTitles
                .filter((title) => tags.includes(title.id))
                .map((title) => title.title)
                .join(', ');
              return <span>{filteredTitles}</span>;
            }
          },
          {
            title: 'Equipment',
            field: 'usedEquipments',
            Cell({ entry: { usedEquipments } }) {
              if (!equipmentTitles) return null; // Check if titles is defined
              const filteredTitles = equipmentTitles
                .filter((title) => usedEquipments.includes(title.id))
                .map((title) => title.title)
                .join(', ');
              return <span>{filteredTitles}</span>;
            }
          },
          {
            title: 'Vimeo',
            field: 'vimeoId',
            Cell({ entry }) {
              return <p>{getValue(entry, 'vimeoId')}</p>;
            }
          },
          {
            title: 'View',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return (
                <Link to={`./${_id}`}>
                  <Button variant="danger" startIcon={<EyeIcon className="h-4 w-4" />} />
                </Link>
              );
            }
          },
          {
            title: 'Edit',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return (
                <UpdateExercise
                  exerciseId={_id}
                  exercises={exercises}
                  exTitles={exerciseTitles}
                  eqTitles={equipmentTitles}
                  caTitles={categoryTitles}
                  tagTitles={tagTitles}
                  onCategoryCreate={refetchCategoryTitles}
                  onTagCreate={refetchTagTitles}
                />
              );
            }
          },
          {
            title: 'Delete',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteExercise exerciseId={_id} />;
            }
          }
        ]}
      />
      <div className="flex justify-center mt-6">
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage}
            lastPage={Math.ceil(exercises.count / 10)}
            maxLength={7}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </>
  );
};
