import { Button, ConfirmationDialog } from "@/components/Elements";
import { Authorization, ROLES } from "@/lib/authorization";
import { updatePumpDays } from '@/features/workouts/api';
import { useMutation, useQueryClient } from "react-query";
import { useNotificationStore } from "@/stores/notifications";
import SaveIcon from "@/lib/icons/SaveIcon";

export const SavePumpDays = ({allDays}) => {
  // Access the client
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();
  const { mutate, isSuccess, isLoading } = useMutation(updatePumpDays, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
      queryClient.invalidateQueries('get-pump-days');
    },
    onError: (err) => {
      console.error('Error updating pump days:', err);
    },
  });

  const handleSavePumpDays = () => {
    mutate(allDays);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <ConfirmationDialog
        icon="danger"
        title={`Save Pump Days`}
        body={`Are you sure you want to save these pump days?`}
        isDone={isSuccess}
        triggerButton={
          <Button variant="danger" startIcon={<SaveIcon className="mr-2" width="20" height="20" />}>Save</Button>
        }
        confirmButton={
          <Button
            variant="danger"
            type="button"
            onClick={handleSavePumpDays}
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