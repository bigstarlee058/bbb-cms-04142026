import { Navigate, Route, Routes } from 'react-router-dom';

import { Users } from './Users';
import { UserDetail } from './UserDetail';

export const UsersRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Users />} />
      <Route path=":userId" element={<UserDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};
