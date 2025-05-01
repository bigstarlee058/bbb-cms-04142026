import { Navigate, Route, Routes } from 'react-router-dom';
import { PopupEquipment } from './PopupEquipment';


export const PopupEquipmentRoutes = () => {
  return (
    <Routes>
      <Route path="popupEquipment" element={<PopupEquipment />} />
    </Routes>
  );
};