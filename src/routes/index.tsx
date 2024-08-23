import { useRoutes } from 'react-router-dom';
import { Landing } from '@/features/misc';
import { useAuth } from '@/lib/auth';
import { protectedRoutes } from './protected';
import { publicRoutes } from './public';
import { Login } from '@/features/auth/routes/Login';

export const AppRoutes = () => {
  const { user } = useAuth();
  const commonRoutes = [{ path: '/', element: <Login /> }];
  const routes = user ? [...protectedRoutes, ...publicRoutes] : publicRoutes;
  const element = useRoutes([...routes, ...commonRoutes]);
  return element;
};
