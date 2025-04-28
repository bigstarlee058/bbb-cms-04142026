import { Button, ConfirmationDialog } from "@/components/Elements";
import { Authorization, ROLES } from "@/lib/authorization";
import { updatePumpDays } from '@/features/workouts/api';
import { useMutation, useQueryClient } from "react-query";
import { useNotificationStore } from "@/stores/notifications";
import SaveIcon from "@/lib/icons/SaveIcon";
import { useState } from "react";

export const SavePumpDays = ({allDays}) => {
  // Access the client
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();
  // const [isSuccess, setIsSuccess] = useState(false);
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
    // setIsSuccess(false);
    console.log(allDays);
    let isExerciseId = true;
    allDays.forEach((workout) => {
      workout.circuits.forEach(circuit => {
        circuit.circuitExercises.forEach(exercise => {
          if (!exercise.exerciseId) {
            isExerciseId = false;
          }
        });
      });

      workout.exercises.forEach(exercise => {
        if (!exercise.exerciseId) {
          isExerciseId = false;
        }
      });
    });

    if(!isExerciseId) {
      addNotification({
        type: 'error',
        title: 'Exercise data is not exist',
      });
    } else {
      mutate(allDays);
    }
    // setIsSuccess(true);
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