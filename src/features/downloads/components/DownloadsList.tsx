import { Table, Button } from '@/components/Elements';
import { formatDate } from '@/utils/format';
import { Download } from '../api';
import { DeleteDownload } from './DeleteDownload';
import { UpdateDownload } from './UpdateDownload';
import { DocumentDownloadIcon } from '@heroicons/react/outline';
import Pagination from '@/components/Elements/Pagination';

type DownloadsListProps = {
  getValue: (item: any, field: string) => any;
  downloadData: any;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  perPage: number;
};

export const DownloadsList = ({
  getValue,
  downloadData,
  currentPage,
  setCurrentPage,
  perPage,
}: DownloadsListProps) => {
  if (!downloadData?.downloads) {
    return <>No Data Found</>;
  }

  const lastPage = Math.ceil((downloadData?.count || 0) / perPage);

  return (
    <>
      <Table<Download>
        data={downloadData.downloads}
        columns={[
          {
            title: 'Title',
            field: 'title',
            Cell({ entry }) {
              return <span>{getValue(entry, 'title')}</span>;
            },
          },
          {
            title: 'Description',
            field: 'description',
            Cell({ entry }) {
              const description = getValue(entry, 'description') || '';
              return (
                <p>
                  {description.length > 100
                    ? `${description.slice(0, 100)}...`
                    : description}
                </p>
              );
            },
          },
          {
            title: 'PDF',
            field: 'pdf',
            Cell({ entry }) {
              const pdfUrl = getValue(entry, 'pdf');
              return pdfUrl ? (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-red-600 hover:text-red-800"
                >
                  <DocumentDownloadIcon className="h-5 w-5 mr-1" />
                  View
                </a>
              ) : (
                <span className="text-gray-400">No PDF</span>
              );
            },
          },
          {
            title: 'Release Date',
            field: 'releaseDate',
            Cell({ entry: { releaseDate } }) {
              return <span>{releaseDate ? formatDate(releaseDate) : '-'}</span>;
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
            width: 70,
            Cell({ entry: { _id } }) {
              return <UpdateDownload downloadId={_id} downloads={downloadData} />;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteDownload downloadId={_id} />;
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