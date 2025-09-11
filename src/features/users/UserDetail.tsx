import { EyeIcon } from '@heroicons/react/outline';
import { Button, PopupDialog } from '@/components/Elements';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { fetchUser, fetchUserWorkout } from './api';
import { ErrorMessage } from '@/types';
import { useState } from 'react';

type UserDetailProps = {
  id: string;
};

export const UserDetail = ({ id }: UserDetailProps) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const { data: userData, isLoading: isLoadingUser, refetch: refetchUser } = useQuery(
    ['get-user', id],
    () => fetchUser(id),
    { enabled: false, onError: (err: ErrorMessage) => {
        addNotification({ type: 'error', title: err.message });
        navigate('/app/users');
    }}
  );

  const { data: userWorkoutHistory, isLoading: isLoadingWorkout, refetch: refetchWorkout } = useQuery(
    ['get-user-history', id],
    () => fetchUserWorkout(id),
    { enabled: false, onError: (err: ErrorMessage) => {
        addNotification({ type: 'error', title: err.message });
        navigate('/app/users');
    }}
  );

  const handleOpen = async () => {
    setIsPopupOpen(true);
    await Promise.all([refetchUser(), refetchWorkout()]); // fetch data in background
  };

  if (user?.uid === id) return null;

  return (
    
    <PopupDialog
      icon="info"
      name={userData?.name || 'Loading...'}
      email={userData?.email || ''}
      userData={userData || ({} as any)}
      workoutsHistory={userWorkoutHistory || []}
      isLoading={isLoadingUser || isLoadingWorkout}
      isOpen={isPopupOpen}
      onClose={() => setIsPopupOpen(false)}
      triggerButton={
        <Button
          variant="danger"
          startIcon={<EyeIcon className="h-4 w-4" />}
          onClick={handleOpen}
        />
      }
    />
  );
};
