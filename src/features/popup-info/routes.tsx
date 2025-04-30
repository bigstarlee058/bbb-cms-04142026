import { Navigate, Route, Routes } from 'react-router-dom';
import { PopupInfo } from './PopupInfo';


export const PopupRoutes = () => {
  return (
    <Routes>
      <Route path="popupInformation" element={<PopupInfo />} />
    </Routes>
  );
};