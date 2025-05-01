import { Navigate, Route, Routes } from 'react-router-dom';

import { FaqDetail } from './FaqDetail';
import { Faqs } from './Faqs';

export const FaqsRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Faqs />} />
      <Route path=":faqId" element={<FaqDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};