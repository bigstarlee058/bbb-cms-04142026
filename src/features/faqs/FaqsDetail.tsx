import { ContentLayout } from '@/components/Layout';
import { useNotificationStore } from '@/stores/notifications';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorMessage } from '@/types';
import { Spinner } from '@/components/Elements';
import { Head } from '@/components/Head';
import { formatDate } from '@/utils/format';
import { fetchFaqs } from './api';

export const FaqsDetail = () => {
  const { faqsId } = useParams();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(['get-faqs', faqsId], () => fetchFaqs(faqsId), {
    onError: (err: ErrorMessage) => {
      addNotification({
        type: 'success',
        title: err.message
      });
      navigate('/app/faqs');
    }
  });

  if (isLoading || !data) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }
  return (
    <>
      <Head title={data.question} />
      <ContentLayout title={data.question}>
        <span className="text-xs font-bold">{formatDate(data.createdAt)}</span>
        <div>
          <span className="text-xs font-bold">{data.answer}</span>
        </div>
      </ContentLayout>
    </>
  );
};
