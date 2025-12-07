import { Navigate, Route, Routes } from 'react-router-dom';

import { Tools } from './Tools';

export const ToolsRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Tools />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};
