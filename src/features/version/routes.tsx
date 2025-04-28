import { Navigate, Route, Routes } from 'react-router-dom';
import { VersionManage } from './VersionManage';


export const VersionRoutes = () => {
  return (
    <Routes>
      <Route path="versionManage" element={<VersionManage />} />
    </Routes>
  );
};