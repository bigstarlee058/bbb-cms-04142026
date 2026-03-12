import { useRoutes, Navigate } from 'react-router-dom';
import { protectedRoutes } from './protected';
import { publicRoutes } from './public';
import { Login } from '@/features/auth/routes/Login';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from 'react-query';
import { fetchMe } from '@/features/users';

export const AppRoutes = () => {
  const { isLogged, setIsLogged, setUser } = useAuthStore();

  const { isLoading } = useQuery('me', fetchMe, {
    enabled: isLogged,
    onSuccess: setUser,
    onError: () => {
      setIsLogged(false);
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
    },
  });

  if (isLogged && isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  }

  const commonRoutes = [
    { path: '/', element: isLogged ? <Navigate to="/app" replace /> : <Login /> },
    { path: '*', element: <Navigate to="/" replace /> }
  ];

  const routes = isLogged 
    ? [...protectedRoutes, ...publicRoutes, ...commonRoutes] 
    : [...publicRoutes, ...commonRoutes];

  return useRoutes(routes);
};
