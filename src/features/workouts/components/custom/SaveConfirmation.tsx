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
    let monthId = 0;
    let weekId = 0;
    let isComplete = true;
    allMonths.forEach((month) => {
      month.weeks.forEach((week) => {
        const countDaysWithFormat3 = week.days.filter(day => day.formats.includes('3')).length;
        const countDaysWithFormat4 = week.days.filter(day => day.formats.includes('4')).length;
        const countDaysWithFormat5 = week.days.filter(day => day.formats.includes('5')).length;
        
        if(countDaysWithFormat3 != 3 || countDaysWithFormat4 != 4 || countDaysWithFormat5 != 5) {
          monthId = month.index;
          weekId = week.index;
          isComplete = false;
        }
      });
    });
    if(!isComplete) {
      addNotification({
        type: 'error',
        title: `Please select variation availability for Month ${monthId} Week ${weekId}`,
      });
    } else {
      mutate(allMonths);
    }
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