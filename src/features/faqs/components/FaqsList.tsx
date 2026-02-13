import { Table } from '@/components/Elements';
import { Faq } from '@/types';
import { DeleteFaq } from './DeleteFaq';
import { UpdateFaq } from './UpdateFaq';
import Pagination from '@/components/Elements/Pagination';

export const FaqsList = ({
  getValue,
  faqsData,
  currentPage,
  setCurrentPage,
  perPage,
}: {
  getValue: (item: any, field: string) => any;
  faqsData: any;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  perPage: number;
}) => {
  if (!faqsData?.faqs) return <>No Data Found</>;

  return (
    <>
      <Table<Faq>
        data={faqsData.faqs}
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