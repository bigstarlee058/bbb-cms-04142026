import { Navigate, Route, Routes } from 'react-router-dom';
import { Upsells } from '../components/Upsells';

export const MoneyRoutes = () => {
  return (
    <Routes>
      <Route path="upsells" element={<Upsells />} />
      <Route path="*" element={<Navigate to="upsells" />} />
    </Routes>
  );
};