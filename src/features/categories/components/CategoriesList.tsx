import { Table, Link, Button } from '@/components/Elements';
import { Category } from '@/types';
import { EyeIcon } from '@heroicons/react/outline';
import { DeleteCategory } from './DeleteCategory';
import { UpdateCategory } from './UpdateCategory';
import Pagination from '@/components/Elements/Pagination';

export const CategoriesList = ({
  getValue,
  categoryData,
  currentPage,
  setCurrentPage
}: {
  getValue: (item: any, field: string) => any,
  categoryData: any,
  currentPage: number,
  setCurrentPage: (page: number) => void
}) => {
  if (!categoryData) return null;

  return (
    <>
      <Table<Category>
        data={categoryData.categories}
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
                  <img className="h-24 object-contain" src={getValue(entry, 'thumbnail')} loading="lazy" />
                </div>);
            },
          },
          {
            title: 'Exercise Count',
            field: 'exerciseCount',
          },
          {
            title: '',
            field: '_id',
            width: 70,
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
            width: 70,
            Cell({ entry: { _id } }) {
              return <UpdateCategory categoryId={_id} categories={categoryData} />;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteCategory categoryId={_id} />;
            },
          },
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil(categoryData.count / 10)}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
