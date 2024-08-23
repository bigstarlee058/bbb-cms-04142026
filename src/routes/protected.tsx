import { Suspense } from 'react';
import { Spinner } from '@/components/Elements';
import { MainLayout } from '@/components/Layout';
import { lazyImport } from '@/utils/lazyImport';
import { Navigate, Outlet } from 'react-router-dom';

const { Dashboard } = lazyImport(() => import('@/features/misc'), 'Dashboard');
const { Profile } = lazyImport(() => import('@/features/users'), 'Profile');
const { UsersRoutes } = lazyImport(() => import('@/features/users'), 'UsersRoutes');
const { WorkoutsRoutes } = lazyImport(() => import('@/features/workouts'), 'WorkoutsRoutes');
const { WarmupRoutes } = lazyImport(() => import('@/features/warmups'), 'WarmupRoutes');
const { ExercisesRoutes } = lazyImport(() => import('@/features/exercises'), 'ExercisesRoutes');
const { EquipmentRoutes } = lazyImport(() => import('@/features/equipment'), 'EquipmentRoutes');
const { RestdayRoutes } = lazyImport(() => import('@/features/restdays'), 'RestdayRoutes');

const ProtectedApp = () => {
  return (
    <MainLayout>
      <Suspense
        fallback={
          <div className="h-full w-full flex items-center justify-center">
            <Spinner size="xl" />
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </MainLayout>
  );
};

export const protectedRoutes = [
  {
    path: '/app',
    element: <ProtectedApp />,
    children: [
      { path: '', element: <Dashboard /> },
      { path: 'profile', element: <Profile /> },
      { path: 'users/*', element: <UsersRoutes /> },
      { path: 'workouts/*', element: <WorkoutsRoutes /> },
      { path: 'exercises/*', element: <ExercisesRoutes /> },
      { path: 'warmups/*', element: <WarmupRoutes /> },
      { path: 'equipments/*', element: <EquipmentRoutes /> },
      { path: 'restdays/*', element: <RestdayRoutes /> },
      { path: '*', element: <Navigate to="/app" /> },
    ],
  },
];
