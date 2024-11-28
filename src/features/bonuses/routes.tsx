import { Navigate, Route, Routes } from 'react-router-dom';

import { Bonuses } from './Bonuses';
import { BonusDetail } from './BonusDetail';

export const BonusesRoutes = () => {  
  return (
    <Routes>
      <Route path="" element={<Bonuses />} />
      <Route path=":bonusId" element={<BonusDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};
