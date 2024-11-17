import { Navigate, Route, Routes } from 'react-router-dom';
import { BackgroundScreens } from './BackgroundScreens';


export const ScreensRoutes = () => {
  return (
    <Routes>
      <Route path="backgroundScreens" element={<BackgroundScreens />} />
    </Routes>
  );
};