import { Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from '@/components/Elements';
import { MainLayout } from '@/components/Layout';
import { lazyImport } from '@/utils/lazyImport';
import { Welcome } from '@/features/welcome/Welcome';

const { TagsRoutes } = lazyImport(() => import('@/features/tags'), 'TagsRoutes');
const { CategoriesRoutes } = lazyImport(() => import('@/features/categories'), 'CategoriesRoutes');
const { CollectionsRoutes } = lazyImport(
  () => import('@/features/collections'),
  'CollectionsRoutes'
);
const { EquipmentRoutes } = lazyImport(() => import('@/features/equipment'), 'EquipmentRoutes');
const { ExercisesRoutes } = lazyImport(() => import('@/features/exercises'), 'ExercisesRoutes');
const { QuizzesRoutes } = lazyImport(() => import('@/features/quizzes'), 'QuizzesRoutes');
const { Dashboard } = lazyImport(() => import('@/features/misc'), 'Dashboard');
const { Profile } = lazyImport(() => import('@/features/users'), 'Profile');
const { UsersRoutes } = lazyImport(() => import('@/features/users'), 'UsersRoutes');

const App = () => {
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
    element: <App />,
    children: [
      { path: 'intro', element: <Welcome /> },
      { path: 'tags/*', element: <TagsRoutes /> },
      { path: 'categories/*', element: <CategoriesRoutes /> },
      { path: 'collections/*', element: <CollectionsRoutes /> },
      { path: 'equipment/*', element: <EquipmentRoutes /> },
      { path: 'exercises/*', element: <ExercisesRoutes /> },
      { path: 'quizzes/*', element: <QuizzesRoutes /> },
      { path: 'users/*', element: <UsersRoutes /> },
      { path: 'profile', element: <Profile /> },
      { path: '', element: <Dashboard /> },
      { path: '*', element: <Navigate to="." /> },
    ],
  },
];
