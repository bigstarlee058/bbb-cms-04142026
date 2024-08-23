import { Navigate, Route, Routes } from 'react-router-dom';

import { Workouts } from './Workouts';

export const WorkoutsRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Workouts />} />
    </Routes>
  );
};
