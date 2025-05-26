import { Navigate, Route, Routes } from 'react-router-dom';
// import { BackgroundTutorials } from './BackgroundTutorials';
import { Tutorials } from './Tutorials';


export const TutorialsRoutes = () => {
  return (
    <Routes>
      {/* <Route path="backgroundTutorials" element={<BackgroundTutorials />} /> */}
      <Route path="" element={<Tutorials />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};