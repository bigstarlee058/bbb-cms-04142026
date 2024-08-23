import { Navigate, Route, Routes } from 'react-router-dom';

import { RestdayDetail } from './RestdayDetail';
import { Restdays } from './Restdays';

export const RestdayRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Restdays />} />
      <Route path=":restdayId" element={<RestdayDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};