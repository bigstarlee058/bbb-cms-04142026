import { Button, ConfirmationDialog } from "@/components/Elements";
import { Authorization, ROLES } from "@/lib/authorization";
import { updateWorkouts } from '@/features/workouts/api';
import { useMutation, useQueryClient } from "react-query";
import { useNotificationStore } from "@/stores/notifications";
import SaveIcon from "@/lib/icons/SaveIcon";

export const SaveConfirmation = ({allMonths}) => {
  // Access the client
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();
  const { mutate, isSuccess, isLoading } = useMutation(updateWorkouts, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
      queryClient.invalidateQueries('get-workouts');
    },
    onError: (err) => {
      console.error('Error updating workouts:', err);
    },
  });

  const handleSaveWorkouts = () => {
    mutate(allMonths);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <ConfirmationDialog
        icon="danger"
        title={`Save Workouts`}
        body={`Are you sure you want to save these workouts?`}
        isDone={isSuccess}
        triggerButton={
          <Button variant="danger" startIcon={<SaveIcon className="mr-2" width="20" height="20" />}>Save</Button>
        }
        confirmButton={
          <Button
            variant="danger"
            type="button"
            onClick={handleSaveWorkouts}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Save
          </Button>
        }
      />
    </Authorization>
  )
}