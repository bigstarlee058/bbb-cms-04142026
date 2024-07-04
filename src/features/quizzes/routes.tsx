import { Navigate, Route, Routes } from 'react-router-dom';

import { Quizzes } from './Quizzes';
import { QuizDetail } from './QuizDetail';

export const QuizzesRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Quizzes />} />
      <Route path=":quizId" element={<QuizDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};
