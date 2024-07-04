import { useRoutes } from 'react-router-dom';
import { Landing } from '@/features/misc';
import { useAuth } from '@/lib/auth';
import { protectedRoutes } from './protected';
import { publicRoutes } from './public';

export const AppRoutes = () => {
  const { user } = useAuth();
  const commonRoutes = [{ path: '/', element: <Landing /> }];
  const routes = user ? [...protectedRoutes, ...publicRoutes] : publicRoutes;
  const element = useRoutes([...routes, ...commonRoutes]);
  return <>{element}</>;
};
