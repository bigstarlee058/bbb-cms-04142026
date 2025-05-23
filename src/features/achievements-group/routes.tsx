import { Navigate, Route, Routes } from 'react-router-dom';
import { AchievementsGroup } from './AchievementsGroup';

export const AchievementsGroupRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<AchievementsGroup />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};