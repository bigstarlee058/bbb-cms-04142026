import { Route, Routes } from 'react-router-dom';

import { PumpDays } from './PumpDays';

export const PumpDaysRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<PumpDays />} />
    </Routes>
  );
};
