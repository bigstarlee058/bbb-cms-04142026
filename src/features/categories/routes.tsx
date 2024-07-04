import { Navigate, Route, Routes } from 'react-router-dom';

import { Categories } from './Categories';
import { CategoryDetail } from './CategoryDetail';

export const CategoriesRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Categories />} />
      <Route path=":categoryId" element={<CategoryDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};
