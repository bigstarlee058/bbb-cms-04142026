import { Navigate, Route, Routes } from 'react-router-dom';

import { Collections } from './Collections';
import { CollectionDetail } from './CollectionDetail';

export const CollectionsRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Collections />} />
      <Route path=":collectionId" element={<CollectionDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};
