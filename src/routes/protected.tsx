import { Suspense } from 'react';
import { Spinner } from '@/components/Elements';
import { MainLayout } from '@/components/Layout';
import { lazyImport } from '@/utils/lazyImport';
import { Navigate, Outlet } from 'react-router-dom';
import { BackgroundScreens } from '@/features/screens/BackgroundScreens';
// import { BackgroundTutorials } from '@/features/tutorial/BackgroundTutorials';
import { VersionManage } from '@/features/version/VersionManage';
import { PopupWorkout } from '@/features/popup-workout/PopupWorkout';
import { PopupEquipment } from '@/features/popup-equipment/PopupEquipment';
import { WorkoutContextProvider } from '@/features/workouts/WorkoutContext';
import { MonthCoverContextProvider } from '@/features/workouts/MonthCoverContext';
import { PumpDaysContextProvider } from '@/features/pumpdays/PumpDaysContext';

const { Dashboard } = lazyImport(() => import('@/features/misc'), 'Dashboard');
const { Profile } = lazyImport(() => import('@/features/users'), 'Profile');
const { ScreensRoutes } = lazyImport(() => import('@/features/screens'), 'ScreensRoutes');
const { VersionRoutes } = lazyImport(() => import('@/features/version'), 'VersionRoutes');
const { PopupEquipmentRoutes } = lazyImport(() => import('@/features/popup-equipment'), 'PopupEquipmentRoutes');
const { PopupWorkoutRoutes } = lazyImport(() => import('@/features/popup-workout/'), 'PopupWorkoutRoutes');
const { UsersRoutes } = lazyImport(() => import('@/features/users'), 'UsersRoutes');
const { TutorialsRoutes } = lazyImport(() => import('@/features/tutorial'), 'TutorialsRoutes');
const { WorkoutsRoutes } = lazyImport(() => import('@/features/workouts'), 'WorkoutsRoutes');
const { WarmupRoutes } = lazyImport(() => import('@/features/warmups'), 'WarmupRoutes');
const { ExercisesRoutes } = lazyImport(() => import('@/features/exercises'), 'ExercisesRoutes');
const { EquipmentRoutes } = lazyImport(() => import('@/features/equipment'), 'EquipmentRoutes');
const { RestdayRoutes } = lazyImport(() => import('@/features/restdays'), 'RestdayRoutes');
const { CategoriesRoutes } = lazyImport(() => import('@/features/categories'), 'CategoriesRoutes');
const { TagsRoutes } = lazyImport(() => import('@/features/tags'), 'TagsRoutes');
const { AchievementsGroupRoutes } = lazyImport(() => import('@/features/achievements-group'), 'AchievementsGroupRoutes');
const { AchievementsIndividualRoutes } = lazyImport(() => import('@/features/achievements-individual'), 'AchievementsIndividualRoutes');
const { AchievementsTargetRoutes } = lazyImport(() => import('@/features/achievements-target'), 'AchievementsTargetRoutes');
const { StaffsRoutes } = lazyImport(() => import('@/features/staffs'), 'StaffsRoutes');
const { ChallengesRoutes } = lazyImport(() => import('@/features/challenges'), 'ChallengesRoutes');
const { PhasesRoutes } = lazyImport(() => import('@/features/phases'), 'PhasesRoutes');
const { CollectionsRoutes } = lazyImport(() => import('@/features/collections'), 'CollectionsRoutes');
const { BonusesRoutes } = lazyImport(() => import('@/features/bonuses'), 'BonusesRoutes');
const { ProgramInfoRoutes } = lazyImport(() => import('@/features/program-info'), 'ProgramInfoRoutes');
const { PumpDaysRoutes } = lazyImport(() => import('@/features/pumpdays'), 'PumpDaysRoutes');
const { FaqsRoutes } = lazyImport(() => import('@/features/faqs'), 'FaqsRoutes');

const ProtectedApp = () => {
  return (
    <WorkoutContextProvider>
      <PumpDaysContextProvider>
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
      </PumpDaysContextProvider>
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
      // {
      //   element: <TutorialsRoutes />,
      //   children: [{ path: 'backgroundTutorials', element: <BackgroundTutorials /> }]
      // },
      {
        element: <VersionRoutes />,
        children: [{ path: 'versionManage', element: <VersionManage /> }]
      },
      {
        element: <PopupWorkoutRoutes />,
        children: [{ path: 'popupWorkout', element: <PopupWorkout /> }]
      },
      {
        element: <PopupEquipmentRoutes />,
        children: [{ path: 'popupEquipment', element: <PopupEquipment /> }]
      },
      { path: 'users/*', element: <UsersRoutes /> },
      { path: 'tutorials/*', element: <TutorialsRoutes /> },
      { path: 'workouts/*', element: <WorkoutsRoutes /> },
      { path: 'exercises/*', element: <ExercisesRoutes /> },
      { path: 'warmups/*', element: <WarmupRoutes /> },
      { path: 'equipments/*', element: <EquipmentRoutes /> },
      { path: 'restdays/*', element: <RestdayRoutes /> },
      { path: 'categories/*', element: <CategoriesRoutes /> },
      { path: 'tags/*', element: <TagsRoutes /> },
      { path: 'achievements-group/*', element: <AchievementsGroupRoutes /> },
      { path: 'achievements-individual/*', element: <AchievementsIndividualRoutes /> },
      { path: 'achievements-target/*', element: <AchievementsTargetRoutes /> },
      { path: 'staffs/*', element: <StaffsRoutes /> },
      { path: 'challenges/*', element: <ChallengesRoutes /> },
      { path: 'phases/*', element: <PhasesRoutes /> },
      { path: 'collections/*', element: <CollectionsRoutes /> },
      { path: 'bonuses/*', element: <BonusesRoutes /> },
      { path: 'program-info/*', element: <ProgramInfoRoutes /> },
      { path: 'pumpdays/*', element: <PumpDaysRoutes /> },
      { path: 'faqs/*', element: <FaqsRoutes /> },
      { path: '*', element: <Navigate to="/app" /> }
    ]
  }
];
