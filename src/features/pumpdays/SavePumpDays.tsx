import { Button, ConfirmationDialog } from "@/components/Elements";
import { Authorization, ROLES } from "@/lib/authorization";
import { updatePumpDays } from '@/features/workouts/api';
import { useMutation, useQueryClient } from "react-query";
import { useNotificationStore } from "@/stores/notifications";
import SaveIcon from "@/lib/icons/SaveIcon";
import { cleanupNestedTranslations } from "@/utils/translationHelper";
import { usePumpDaysContext } from './PumpDaysContext';

export const SavePumpDays = ({allDays}) => {
  // Access the client
  const queryClient = useQueryClient();
  const { selectedLanguagesByDay } = usePumpDaysContext();
  const { addNotification } = useNotificationStore();
  // const [isSuccess, setIsSuccess] = useState(false);
  const { mutate, isSuccess, isLoading } = useMutation(updatePumpDays, {
    onSuccess: (message: string) => {
      queryClient.invalidateQueries('get-pump-days');
      addNotification({
        type: 'success',
        title: message,
      });
    },
    onError: (err) => {
      console.error('Error updating pump days:', err);
    },
  });

  const autoFillMissingTranslations = (obj: any, selectedLangs: string[]): any => {
    if (!obj || typeof obj !== 'object' || obj instanceof File) return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => autoFillMissingTranslations(item, selectedLangs));
    }

    const updated = { ...obj };

    Object.keys(updated).forEach(key => {
      if (key.endsWith('Translations')) {
        const baseKey = key.replace('Translations', '');
        const baseValue = updated[baseKey];

        if (baseValue && typeof updated[key] === 'object') {
          updated[key] = { ...updated[key] };
          selectedLangs.forEach(lang => {
            if (!updated[key][lang]) {
              updated[key][lang] = baseValue;
            }
          });
        }
      } else if (typeof updated[key] === 'object' && updated[key] !== null) {
        updated[key] = autoFillMissingTranslations(updated[key], selectedLangs);
      }
    });

    return updated;
  };

  const cleanupDaysData = (days: any[]) => {
    return days.map(day => {
      const selectedLanguages = selectedLanguagesByDay[day.localId] || [];
      const autoFilled = autoFillMissingTranslations(day, selectedLanguages);
      return cleanupNestedTranslations(autoFilled, selectedLanguages);
    });
  };

  const handleSavePumpDays = () => {
    // setIsSuccess(false);
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
      const cleanedDays = cleanupDaysData(allDays);
      mutate(cleanedDays);
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