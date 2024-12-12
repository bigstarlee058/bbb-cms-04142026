import { Navigate, Route, Routes } from 'react-router-dom';

import { SectionDetail } from './SectionDetail';
import { Sections } from './Sections';

export const ProgramInfoRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Sections />} />
      <Route path=":sectionId" element={<SectionDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};