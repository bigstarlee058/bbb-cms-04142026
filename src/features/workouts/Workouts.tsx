import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentLayout } from '@/components/Layout';
import { WorkoutList } from './components/WorkoutList';
import { useUserStore } from '@/stores/user';
import { useLock } from '@/hooks/useLock';
import { LockDialog } from '@/components/LockDialog';
import { Spinner } from '@/components/Elements';
import { FixTranslationsModal } from './components/FixTranslationsModal';
export const Workouts = () => {
  const { setCurrentPage } = useUserStore();
  const navigate = useNavigate();
  const {
    showDialog,
    dialogType,
    lockedByInfo,
    isLockLoading,
    takeOver,
    goReadOnly,
  } = useLock("workouts");

  useEffect(() => {
    setCurrentPage("workouts");
  }, []);

  if (isLockLoading) {
    return (
      <ContentLayout title="">
        <div className="w-full h-48 flex justify-center items-center">
          <Spinner size="lg" />
        </div>
      </ContentLayout>
    );
  }


  return (
    <ContentLayout title="">
      <LockDialog
        isOpen={showDialog}
        type={dialogType}
        lockedBy={lockedByInfo}
        onViewOnly={goReadOnly}
        onTakeOver={takeOver}
      />
      <FixTranslationsModal />
      <div className="mt-2">
        <WorkoutList />
      </div>
    </ContentLayout>
  );
};
