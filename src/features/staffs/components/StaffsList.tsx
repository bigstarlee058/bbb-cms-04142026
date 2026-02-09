import {  useState } from 'react';
import { Table, Link, Button } from '@/components/Elements';
import { Staff } from '@/types';
import { EyeIcon } from '@heroicons/react/outline';
import { DeleteStaff } from './DeleteStaff';
import { UpdateStaff } from './UpdateStaff';
import Pagination from '@/components/Elements/Pagination';

export const StaffsList = ({
  getValue,
  staffData,
}: {
  getValue: (item: any, field: string) => any;
  staffData: any;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  if (!staffData?.staffs) return <>No Data Found</>;

  return (
    <>
      <Table<Staff>
        data={staffData.staffs}
        columns={[
          {
            title: 'Title',
            field: 'title',
            Cell({ entry }) {
              return <span>{getValue(entry, 'title')}</span>;
            },
          },
          {
            title: 'Location',
            field: 'location',
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
            title: 'Type',
            field: 'type',
            Cell({ entry: { type } }) {
              return (<>{type == 1 ? 'Staff' : 'Athlete'}</>);
            },
          },
          {
            title: 'Bio',
            field: 'bio',
            Cell({ entry }) {
              const bio = getValue(entry, 'bio') || '';
              return <span
                dangerouslySetInnerHTML={{
                  __html: bio.length > 100 ? `${bio.slice(0, 100)}...` : bio,
                }}
              />;
            }
          },
          {
            title: 'Link',
            field: 'link',
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
              return <UpdateStaff staffId={_id} staffs={staffData} />;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteStaff staffId={_id} />;
            },
          },
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil((staffData?.count || 0) / perPage)}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
