import { Navigate, Route, Routes } from 'react-router-dom';
import { Downloads } from './Downloads';

export const DownloadsRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Downloads />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};