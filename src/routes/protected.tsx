import { Suspense } from 'react';
import { Spinner } from '@/components/Elements';
import { MainLayout } from '@/components/Layout';
import { lazyImport } from '@/utils/lazyImport';
import { Navigate, Outlet } from 'react-router-dom';
import { BackgroundScreens } from '@/features/screens/BackgroundScreens';
import { BackgroundTutorials } from '@/features/tutorial/BackgroundTutorials';
import { WorkoutContextProvider } from '@/features/workouts/WorkoutContext';
import { MonthCoverContextProvider } from '@/features/workouts/MonthCoverContext';

const { Dashboard } = lazyImport(() => import('@/features/misc'), 'Dashboard');
const { Profile } = lazyImport(() => import('@/features/users'), 'Profile');
const { ScreensRoutes } = lazyImport(() => import('@/features/screens'), 'ScreensRoutes');
const { TutorialsRoutes } = lazyImport(() => import('@/features/tutorial'), 'TutorialsRoutes');
const { UsersRoutes } = lazyImport(() => import('@/features/users'), 'UsersRoutes');
const { WorkoutsRoutes } = lazyImport(() => import('@/features/workouts'), 'WorkoutsRoutes');
const { WarmupRoutes } = lazyImport(() => import('@/features/warmups'), 'WarmupRoutes');
const { ExercisesRoutes } = lazyImport(() => import('@/features/exercises'), 'ExercisesRoutes');
const { EquipmentRoutes } = lazyImport(() => import('@/features/equipment'), 'EquipmentRoutes');
const { RestdayRoutes } = lazyImport(() => import('@/features/restdays'), 'RestdayRoutes');
const { CategoriesRoutes } = lazyImport(() => import('@/features/categories'), 'CategoriesRoutes');
const { StaffsRoutes } = lazyImport(() => import('@/features/staffs'), 'StaffsRoutes');
const { ChallengesRoutes } = lazyImport(() => import('@/features/challenges'), 'ChallengesRoutes');
const { CollectionsRoutes } = lazyImport(() => import('@/features/collections'), 'CollectionsRoutes');
const { BonusesRoutes } = lazyImport(() => import('@/features/bonuses'), 'BonusesRoutes');
const { ProgramInfoRoutes } = lazyImport(() => import('@/features/program-info'), 'ProgramInfoRoutes');

const ProtectedApp = () => {
  return (
    <WorkoutContextProvider>
      <MonthCoverContextProvider>
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
      </MonthCoverContextProvider>
    </WorkoutContextProvider>
  );
};

export const protectedRoutes = [
  {
    path: '/app',
    element: <ProtectedApp />,
    children: [
      { path: '', element: <Dashboard /> },
      { path: 'profile', element: <Profile /> },
      {
        element: <ScreensRoutes />,
        children: [{ path: 'backgroundScreens', element: <BackgroundScreens /> }]
      },
      {
        element: <TutorialsRoutes />,
        children: [{ path: 'backgroundTutorials', element: <BackgroundTutorials /> }]
      },
      { path: 'users/*', element: <UsersRoutes /> },
      { path: 'workouts/*', element: <WorkoutsRoutes /> },
      { path: 'exercises/*', element: <ExercisesRoutes /> },
      { path: 'warmups/*', element: <WarmupRoutes /> },
      { path: 'equipments/*', element: <EquipmentRoutes /> },
      { path: 'restdays/*', element: <RestdayRoutes /> },
      { path: 'categories/*', element: <CategoriesRoutes /> },
      { path: 'staffs/*', element: <StaffsRoutes /> },
      { path: 'challenges/*', element: <ChallengesRoutes /> },
      { path: 'collections/*', element: <CollectionsRoutes /> },
      { path: 'bonuses/*', element: <BonusesRoutes /> },
      { path: 'program-info/*', element: <ProgramInfoRoutes /> },
      { path: '*', element: <Navigate to="/app" /> }
    ]
  }
];
