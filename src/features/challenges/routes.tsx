import { Navigate, Route, Routes } from 'react-router-dom';

import { ChallengeDetail } from './ChallengeDetail';
import { Challenges } from './Challenges';

export const ChallengesRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Challenges />} />
      <Route path=":challengeId" element={<ChallengeDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};