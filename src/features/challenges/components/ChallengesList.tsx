import {  useState } from 'react';
import { Table, Link, Button } from '@/components/Elements';
import { Challenge } from '@/types';
import { EyeIcon } from '@heroicons/react/outline';
import { DeleteChallenge } from './DeleteChallenge';
import { UpdateChallenge } from './UpdateChallenge';
import Pagination from '@/components/Elements/Pagination';
import { ToggleHide } from './ToggleHide';

export const ChallengesList = ({
  getValue,
  challengeData,
}: {
  getValue: (item: any, field: string) => any;
  challengeData: any;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  if (!challengeData?.challenges) return <>No Data Found</>;
  return (
    <>
      <Table<Challenge>
        data={challengeData.challenges}
        columns={[
          {
            title: 'Title',
            field: 'title',
            Cell({ entry }) {
              return <span>{getValue(entry, 'title')}</span>;
            },
          },
          {
            title: 'Photo',
            field: 'photo',
            Cell({ entry }) {
              return (
                <div className="justify-center items-center">
                  <img className="h-24 object-contain" src={getValue(entry, 'photo')} />
                </div>
              );
            },
          },
          {
            title: 'Description',
            field: 'description',
            Cell({ entry }) {
              const description = getValue(entry, 'description') || '';
              return <p>{description.length > 100 ? `${description.slice(0, 100)}...` : description}</p>;
            },
          },
          {
            title: 'Button Text',
            field: 'buttonText',
            Cell({ entry }) {
              return <span>{getValue(entry, 'buttonText')}</span>;
            },
          },
          {
            title: 'Link',
            field: 'link',
          },
          {
            title: 'Visible',
            field: 'isHide',
            Cell({ entry: { isHide, _id } }) {
              return (
                <ToggleHide
                  challengeId={_id}
                  isHide={isHide}
                />
              );
            },
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
              return <UpdateChallenge challengeId={_id} challenges={challengeData} />;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteChallenge challengeId={_id} />;
            },
          },
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil((challengeData?.count || 0) / perPage)}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
