import { Navigate, Route, Routes } from 'react-router-dom';

import { Tags } from './Tags';
import { TagDetail } from './TagDetail';

export const TagsRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Tags />} />
      <Route path=":tagId" element={<TagDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};
