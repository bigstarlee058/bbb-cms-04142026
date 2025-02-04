import { useRoutes } from 'react-router-dom';
import { protectedRoutes } from './protected';
import { publicRoutes } from './public';
import { Login } from '@/features/auth/routes/Login';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from 'react-query';
import { fetchMe } from '@/features/users';

// Encapsulating the auth logic

export const AppRoutes = () => {
  const { isLogged, setIsLogged, setUser, user } = useAuthStore();
  useQuery('me', fetchMe, {
    enabled: isLogged,
    onSuccess: setUser,
    onError: () => {
      setIsLogged(false);
    },
  });
  const commonRoutes = [{ path: '/', element: <Login /> }];
  const routes = user.role == 1 ? [...protectedRoutes, ...publicRoutes] : commonRoutes;
  const element = useRoutes([...routes, ...commonRoutes]);
  return element;
};
