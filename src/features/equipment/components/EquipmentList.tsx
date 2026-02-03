import { Table, Link, Button } from '@/components/Elements';
import { formatDate } from '@/utils/format';
import { Equipment, Filters } from '@/types';
import { DeleteEquipment } from './DeleteEquipment';
import { EyeIcon } from '@heroicons/react/outline';
import { UpdateEquipment } from './UpdateEquipment';
import Pagination from '@/components/Elements/Pagination';

export const EquipmentList = ({
  getValue,
  equipmentData,
  titles,
  currentPage,
  setCurrentPage
}: {
  getValue: (item: any, field: string) => any,
  equipmentData: any,
  titles: any,
  currentPage: number,
  setCurrentPage: (page: number) => void
}) => {

  const decodeHTML = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  if (!equipmentData) return null;
  return (
    <>
      <Table<Equipment>
        data={equipmentData.equipments}
        columns={[
          {
            title: 'Title',
            field: 'title',
            Cell({ entry }) {
              return getValue(entry, 'title');
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
            title: 'Description',
            field: 'description',
            Cell({ entry }) {
              return (
                <span
                  dangerouslySetInnerHTML={{
                    __html: decodeHTML(getValue(entry, 'description')),
                  }}
                />
              );
            }
          },
          {
            title: 'URL',
            field: 'link',
            Cell({ entry }) {
              const link = getValue(entry, 'link');
              return (
                <a href={link} target="_blank">
                  {link}
                </a>
              );
            },
          },
          {
            title: 'Created On',
            field: 'createdAt',
            Cell({ entry: { createdAt } }) {
              return <span>{formatDate(createdAt)}</span>;
            },
          },
          {
            title: '',
            field: '_id',
            Cell({ entry: { _id } }) {
              return (
                <div className="flex items-center gap-2">
                  <Link to={`./${_id}`}>
                    <Button
                      variant="danger"
                      startIcon={<EyeIcon className="h-4 w-4" />}
                    />
                  </Link>

                  <UpdateEquipment
                    equipmentId={_id}
                    equipments={equipmentData}
                    titles={titles}
                  />

                  <DeleteEquipment equipmentId={_id} />
                </div>

              );
            },
          },
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil(equipmentData.count / 10)}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
