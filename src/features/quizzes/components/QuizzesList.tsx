import { Table, Spinner, Link, ConfirmationDialog } from '@/components/Elements';
import { formatDate } from '@/utils/format';
import { useQuery } from 'react-query';
import { fetchQuizzes } from '../api';
import { Quiz } from '@/types';
import { DeleteQuiz } from './DeleteQuiz';

export const QuizzesList = () => {
  const { data, isLoading } = useQuery('get-quizzes', fetchQuizzes);

  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <Table<Quiz>
      data={data}
      columns={[
        {
          title: 'Title',
          field: 'title',
        },
        {
          title: 'Level',
          field: 'level',
        },
        /*
        {
          title: 'Created At',
          field: 'createdAt',
          Cell({ entry: { createdAt } }) {
            return <span>{formatDate(createdAt)}</span>;
          },
        },
        */
        {
          title: '',
          field: '_id',
          Cell({ entry: { _id } }) {
            return <Link to={`./${_id}`}>View</Link>;
          },
        },
        {
          title: '',
          field: '_id',
          Cell({ entry: { _id } }) {
            return <DeleteQuiz quizId={_id} />;
          },
        },
      ]}
    />
  );
};
