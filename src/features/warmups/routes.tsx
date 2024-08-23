import { Navigate, Route, Routes } from 'react-router-dom';

import { Warmups } from './Warmups';
import { WarmupDetail } from './WarmupDetail';

export const WarmupRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Warmups />} />
      <Route path=":warmupId" element={<WarmupDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};