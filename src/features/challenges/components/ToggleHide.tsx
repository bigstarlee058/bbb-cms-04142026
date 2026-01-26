import { useMutation } from 'react-query';
import { toggleChallengeVisible } from '../api';
import { useNotificationStore } from '@/stores/notifications';

type Props = {
  challengeId: string;
  isHide: boolean;
};

export const ToggleHide = ({ challengeId, isHide }: Props) => {
  const { addNotification } = useNotificationStore();

  const mutation = useMutation(
    (newValue: boolean) =>
      toggleChallengeVisible(challengeId, newValue),
    {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: isHide
            ? 'Challenge is now visible'
            : 'Challenge is now hidden',
        });
      },
      onError: () => {
        addNotification({
          type: 'error',
          title: 'Failed to update visibility',
        });
      },
    }
  );

  const isEnabled = !isHide;

  return (
    <button
      type="button"
      disabled={mutation.isLoading}
      onClick={() => mutation.mutate(!isHide)}
      className="flex items-center gap-2"
    >
      <div
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
          ${isEnabled ? 'bg-bbb' : 'bg-gray-300'}
        `}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${isEnabled ? 'translate-x-4' : 'translate-x-1'}
          `}
        />
      </div>

      <span
        className={`text-sm font-medium ${
          isEnabled ? 'text-bbb' : 'text-gray-900'
        }`}
      >
        {isEnabled ? 'Yes' : 'No'}
      </span>
    </button>
  );
};