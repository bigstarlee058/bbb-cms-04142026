import { useState } from 'react';
import { Table } from '@/components/Elements';
import { Faq } from '@/types';
import { DeleteFaq } from './DeleteFaq';
import { UpdateFaq } from './UpdateFaq';
import Pagination from '@/components/Elements/Pagination';

export const FaqsList = ({
  getValue,
  faqsData,
}: {
  getValue: (item: any, field: string) => any;
  faqsData: any;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  if (!faqsData?.faqs) return <>No Data Found</>;
  const startIndex = (currentPage - 1) * perPage;
  const paginatedFaqs = faqsData.faqs.slice(startIndex, startIndex + perPage);
  return (
    <>
      <Table<Faq>
        data={paginatedFaqs}
        columns={[
          {
            title: 'Question',
            field: 'question',
            Cell({ entry }) {
              return <span>{getValue(entry, 'question')}</span>;
            },
          },
          {
            title: 'Answer',
            field: 'answer',
            Cell({ entry }) {
              const answer = getValue(entry, 'answer') || '';
              return <p>{answer.length > 100 ? `${answer.slice(0, 100)}...` : answer}</p>;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <UpdateFaq faqId={_id} faqs={faqsData} />;
            },
          },
          {
            title: '',
            field: '_id',
            width: 70,
            Cell({ entry: { _id } }) {
              return <DeleteFaq faqId={_id} />;
            },
          },
        ]}
      />
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          lastPage={Math.ceil((faqsData?.count || 0) / perPage)}
          maxLength={7}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};