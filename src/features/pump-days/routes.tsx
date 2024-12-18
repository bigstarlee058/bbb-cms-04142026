import { Navigate, Route, Routes } from 'react-router-dom';

import { PumpDayDetail } from './PumpDayDetail';
import { PumpDays } from './PumpDays';

export const PumpDaysRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<PumpDays />} />
      <Route path=":pumpDayId" element={<PumpDayDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};