import {  Route, Routes } from 'react-router-dom';
import { PopupNewJoin } from './PopupNewJoin';


export const PopupNewJoinRoutes = () => {
  return (
    <Routes>
      <Route path="new-join-users" element={<PopupNewJoin />} />
    </Routes>
  );
};``