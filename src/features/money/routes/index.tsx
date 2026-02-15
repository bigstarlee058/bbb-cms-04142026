import { Navigate, Route, Routes } from 'react-router-dom';
import { Upsells } from '../components/Upsells';

export const UpsellsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Upsells />} />
      <Route path="/upsells*" element={<Navigate to="upsells" />} />
    </Routes>
  );
};