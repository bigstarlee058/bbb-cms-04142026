import { Navigate, Route, Routes } from 'react-router-dom';
import { AchievementsIndividual } from './AchievementsIndividual';

export const AchievementsIndividualRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<AchievementsIndividual />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};