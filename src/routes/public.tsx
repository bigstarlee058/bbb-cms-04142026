import { lazyImport } from '@/utils/lazyImport';
import { Navigate } from 'react-router-dom';

const { AuthRoutes } = lazyImport(() => import('@/features/auth'), 'AuthRoutes');

export const publicRoutes = [
  {
    path: '/auth/*',
    element: <AuthRoutes />,
  },
];
