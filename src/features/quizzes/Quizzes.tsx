import { ContentLayout } from '@/components/Layout';
import { QuizzesList } from './components/QuizzesList';
import { CreateQuiz } from './components/CreateQuiz';

export const Quizzes = () => {
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateQuiz />
      </div>
      <div className="mt-4">
        <QuizzesList />
      </div>
    </ContentLayout>
  );
};
