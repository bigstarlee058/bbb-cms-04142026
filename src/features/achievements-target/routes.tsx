import { Navigate, Route, Routes } from 'react-router-dom';

import { AchievementsTarget } from './AchievementsTarget';

export const AchievementsTargetRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<AchievementsTarget />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};
