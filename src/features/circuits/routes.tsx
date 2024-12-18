import { Navigate, Route, Routes } from 'react-router-dom';

import { CircuitDetail } from './CircuitDetail';
import { Circuits } from './Circuits';

export const CircuitsRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Circuits />} />
      <Route path=":circuitId" element={<CircuitDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};