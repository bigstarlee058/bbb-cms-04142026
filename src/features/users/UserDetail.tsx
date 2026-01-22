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

const UserDetailPopup = ({ 
  id, 
  onClose 
}: { 
  id: string; 
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();

  const { data: userData, isLoading: isLoadingUser } = useQuery(
    ['get-user', id],
    () => fetchUser(id),
    { 
      onError: (err: ErrorMessage) => {
        addNotification({ type: 'error', title: err.message });
        navigate('/app/users');
      }
    }
  );

  const { data: userWorkoutHistory, isLoading: isLoadingWorkout } = useQuery(
    ['get-user-history', id],
    () => fetchUserWorkout(id),
    { enabled: false, onError: (err: ErrorMessage) => {
        addNotification({ type: 'error', title: err.message });
        navigate('/app/users');
    }}
  );
  return (
    
    <PopupDialog
      icon="info"
      name={userData?.name || 'Loading...'}
      email={userData?.email || ''}
      userData={userData || ({} as any)}
      workoutsHistory={userWorkoutHistory || []}
      isLoading={isLoadingUser || isLoadingWorkout}
      isOpen={true}
      onClose={onClose}
      triggerButton={<span style={{ display: 'none' }} />}
    />
  );
};
export const UserDetail = ({ id }: UserDetailProps) => {
  const { user } = useAuthStore();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  if (user?.uid === id) return null;

  return (
    <>
      <Button
        variant="danger"
        startIcon={<EyeIcon className="h-4 w-4" />}
        onClick={() => setIsPopupOpen(true)}
      />
      {isPopupOpen && (
        <UserDetailPopup
          id={id}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </>
  );
};