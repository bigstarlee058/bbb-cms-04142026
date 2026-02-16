import { Button, ConfirmationDialog } from "@/components/Elements";
import { Authorization, ROLES } from "@/lib/authorization";
import { updateWorkouts } from '@/features/workouts/api';
import { useMutation, useQueryClient } from "react-query";
import { useNotificationStore } from "@/stores/notifications";
import SaveIcon from "@/lib/icons/SaveIcon";
import { ArrowNarrowUpIcon } from "@heroicons/react/solid";
import { cleanupNestedTranslations } from "@/utils/translationHelper";
import { useWorkoutContext } from '../../WorkoutContext';
import { useLockStore } from '@/stores/lock';
export const SaveConfirmation = ({ allMonths }) => {
  // Access the client
  const queryClient = useQueryClient();
  const { selectedLanguagesByMonth } = useWorkoutContext();
  const { addNotification } = useNotificationStore();
  const { isReadOnly } = useLockStore();
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

  const autoFillMissingTranslations = (obj: any, selectedLangs: string[]): any => {
    if (!obj || typeof obj !== 'object' || obj instanceof File || obj instanceof Date) return obj;

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
  const cleanupMonthsData = (months: any[]) => {
    return months.map(month => {
      const selectedLanguages = selectedLanguagesByMonth[month.localId] || [];

      const autoFilled = autoFillMissingTranslations(month, selectedLanguages);

      return cleanupNestedTranslations(autoFilled, selectedLanguages);
    });
  };

  const hasIncompleteItems = (months: any[]) => {
    for (let mIndex = 0; mIndex < months.length; mIndex++) {
      const month = months[mIndex];
      for (let wIndex = 0; wIndex < month.weeks.length; wIndex++) {
        const week = month.weeks[wIndex];
        for (let dIndex = 0; dIndex < week.days.length; dIndex++) {
          const day = week.days[dIndex];

          for (let wuIndex = 0; wuIndex < (day.warmups || []).length; wuIndex++) {
            const warmup = day.warmups[wuIndex];
            if (!warmup.warmupId || warmup.warmupId.trim() === '') {
              return {
                type: 'warmup',
                monthIndex: month.index ?? mIndex + 1,
                weekIndex: week.index ?? wIndex + 1,
                dayTitle: day.title || `Day ${dIndex + 1}`,
                itemIndex: warmup.typeId ?? wuIndex + 1,
                itemTitle: warmup.title || null
              };
            }
          }

          for (let exIndex = 0; exIndex < (day.exercises || []).length; exIndex++) {
            const exercise = day.exercises[exIndex];
            if (!exercise.exerciseId || exercise.exerciseId.trim() === '') {
              return {
                type: 'exercise',
                monthIndex: month.index ?? mIndex + 1,
                weekIndex: week.index ?? wIndex + 1,
                dayTitle: day.title || `Day ${dIndex + 1}`,
                itemIndex: exercise.typeId ?? exIndex + 1,
                itemTitle: exercise.title || null
              };
            }
          }
        }
      }
    }
    return null;
  };

  const handleSaveWorkouts = () => {
    if (isReadOnly) {
      addNotification({
        type: 'error',
        title: 'You do not have the editing lock. Cannot save.',
      });
      return;
    }
    const incomplete = hasIncompleteItems(allMonths);
    if (incomplete) {
      const itemName = incomplete.itemTitle
        ? `${incomplete.type} "${incomplete.itemTitle}"`
        : `${incomplete.type} ${incomplete.itemIndex}`;

      addNotification({
        type: 'error',
        title: `Please select ${itemName} in Month ${incomplete.monthIndex} in Week ${incomplete.weekIndex} in Day ${incomplete.dayTitle}`,
      });
      return;
    }
    const cleanedMonths = cleanupMonthsData(allMonths);
    mutate(cleanedMonths);
  };

  const handlePublishWorkouts = () => {
    if (isReadOnly) {
      addNotification({
        type: 'error',
        title: 'You do not have the editing lock. Cannot save.',
      });
      return;
    }
    const incomplete = hasIncompleteItems(allMonths);
    if (incomplete) {
      const itemName = incomplete.itemTitle
        ? `${incomplete.type} "${incomplete.itemTitle}"`
        : `${incomplete.type} ${incomplete.itemIndex}`;

      addNotification({
        type: 'error',
        title: `Please select ${itemName} in Month ${incomplete.monthIndex} in Week ${incomplete.weekIndex} in Day ${incomplete.dayTitle}`,
      });
      return;
    }

    let monthId = 0;
    let weekId = 0;
    let isComplete = true;
    allMonths.forEach((month) => {
      month.weeks.forEach((week) => {
        const countDaysWithFormat3 = week.days.filter(day => day.formats.includes('3')).length;
        const countDaysWithFormat4 = week.days.filter(day => day.formats.includes('4')).length;
        const countDaysWithFormat5 = week.days.filter(day => day.formats.includes('5')).length;

        if (countDaysWithFormat3 != 3 || countDaysWithFormat4 != 4 || countDaysWithFormat5 != 5) {
          monthId = month.index;
          weekId = week.index !== undefined && week.index !== null ? week.index : month.weeks.length;
          isComplete = false;
        }
      });
    });
    if (!isComplete) {
      addNotification({
        type: 'error',
        title: `Please select variation availability for Month ${monthId} Week ${weekId}`,
      });
    } else {
      const cleanedMonths = cleanupMonthsData(allMonths);
      mutate(cleanedMonths);
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
          <Button variant="danger" disabled={isReadOnly} startIcon={<SaveIcon className="mr-2" width="20" height="20" />}>Save</Button>
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
      <ConfirmationDialog
        icon="danger"
        title={`Publish Workouts`}
        body={`Are you sure you want to publish these workouts?`}
        isDone={isSuccess}
        triggerButton={
          <Button variant="danger" className="ml-2" disabled={isReadOnly} startIcon={<ArrowNarrowUpIcon className="mr-2" width="20" height="20" />}>Publish</Button>
        }
        confirmButton={
          <Button
            variant="danger"
            type="button"
            onClick={handlePublishWorkouts}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Publish
          </Button>
        }
      />
    </Authorization>
  )
}