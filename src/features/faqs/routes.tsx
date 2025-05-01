import { Navigate, Route, Routes } from 'react-router-dom';

import { FaqsDetail } from './FaqsDetail';
import { Faqs } from './Faqs';

export const FaqsRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Faqs />} />
      <Route path=":faqsId" element={<FaqsDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};