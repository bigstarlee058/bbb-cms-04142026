import { Navigate, Route, Routes } from 'react-router-dom';

import { Exercises } from './Exercises';
import { ExerciseDetail } from './ExerciseDetail';

export const ExercisesRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Exercises />} />
      <Route path=":exerciseId" element={<ExerciseDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};
