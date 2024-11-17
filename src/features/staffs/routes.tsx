import { Navigate, Route, Routes } from 'react-router-dom';

import { StaffDetail } from './StaffDetail';
import { Staffs } from './Staffs';

export const StaffsRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Staffs />} />
      <Route path=":staffId" element={<StaffDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};