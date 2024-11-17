import { Navigate, Route, Routes } from 'react-router-dom';
import { BackgroundTutorials } from './BackgroundTutorials';


export const TutorialsRoutes = () => {
  return (
    <Routes>
      <Route path="backgroundTutorials" element={<BackgroundTutorials />} />
    </Routes>
  );
};