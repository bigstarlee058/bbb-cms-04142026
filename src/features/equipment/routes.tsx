import { Navigate, Route, Routes } from 'react-router-dom';

import { Equipments } from './Equipments';
import { EquipmentDetail } from './EquipmentDetail';

export const EquipmentRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Equipments />} />
      <Route path=":equipmentId" element={<EquipmentDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};
