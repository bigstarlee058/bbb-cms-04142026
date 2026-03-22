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
import { useState } from 'react';
export const SaveConfirmation = ({ allMonths }) => {
  // Access the client
  const [deleteToggles, setDeleteToggles] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();
  const { selectedLanguagesByMonth, setSelectedLanguagesForMonth } = useWorkoutContext();
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

  const getExistingLangsForMonth = (month: any) => {
    const existingLangs = new Set<string>();
    const collectTranslationKeys = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;

      Object.keys(obj).forEach(key => {
        if (key.endsWith('Translations') && obj[key] && typeof obj[key] === 'object') {
          Object.keys(obj[key]).forEach(langKey => {
            if (obj[key][langKey] && String(obj[key][langKey]).trim() !== '') {
              existingLangs.add(langKey);
            }
          });
        } else if (Array.isArray(obj[key])) {
          obj[key].forEach(item => collectTranslationKeys(item));
        } else if (typeof obj[key] === 'object' && obj[key] !== null && !(obj[key] instanceof File) && !(obj[key] instanceof Date)) {
          collectTranslationKeys(obj[key]);
        }
      });
    };
    collectTranslationKeys(month);
    return Array.from(existingLangs);
  };

  const getDroppedLanguagesWarnings = () => {
    const dropped: any[] = [];

    allMonths.forEach((month, index) => {
      if (selectedLanguagesByMonth[month.localId] !== undefined) {
        const existing = getExistingLangsForMonth(month);
        const selected = selectedLanguagesByMonth[month.localId];
        const droppedLangs = existing.filter(l => !selected.includes(l));

        if (droppedLangs.length > 0) {
          dropped.push({
            monthLocalId: month.localId, 
            monthIndex: month.index !== undefined ? month.index : index + 1,
            monthTitle: month.title || 'Untitled',
            langs: droppedLangs
          });
        }
      }
    });
    return dropped;
  };

  const renderDialogBody = (actionText: string) => {
    const warnings = getDroppedLanguagesWarnings();

    if (warnings.length === 0) {
      return `Are you sure you want to ${actionText} these workouts?`;
    }
    const allKept = warnings.every(w => (deleteToggles[w.monthLocalId] ?? false) === false);

    return (
      <div className="flex flex-col gap-4 text-left">
        <div className="text-red-600 font-bold leading-tight">
          WARNING: Unselected languages will lose their data.<br />
          <span className="text-gray-700 font-medium text-sm">Toggle ON to confirm deletion, or leave OFF to KEEP translations.</span>
        </div>

        <div className="flex flex-col gap-3">
          {warnings.map((w, i) => {
            const isDeleting = deleteToggles[w.monthLocalId] ?? false;
            return (
              <div key={i} className="flex items-center gap-3 bg-gray-50 p-2 rounded-md border border-gray-200">
                <button
                  type="button"
                  onClick={() => setDeleteToggles(prev => ({ ...prev, [w.monthLocalId]: !isDeleting }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${isDeleting ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDeleting ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
                <div className="flex flex-col text-sm">
                  <span className={`font-semibold ${isDeleting ? 'text-red-600' : 'text-green-600'}`}>
                    {isDeleting ? 'Deleting:' : 'Keeping:'} {w.langs.join(', ').toUpperCase()}
                  </span>
                  <span className="font-medium text-gray-600">
                    {w.monthIndex} | {w.monthTitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {allKept && (
          <div className="text-green-700 bg-green-50 p-3 rounded-md border border-green-200 text-sm font-medium">
            All dropped translations will be RESTORED and saved.
          </div>
        )}

        <div className="mt-2 text-gray-800 font-medium">
          Are you sure you want to {actionText} these workouts?
        </div>
      </div>
    );
  };

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
      let finalSelectedLanguages = selectedLanguagesByMonth[month.localId] !== undefined
        ? [...selectedLanguagesByMonth[month.localId]]
        : getExistingLangsForMonth(month);
      const isDeleting = deleteToggles[month.localId] ?? false;
      if (!isDeleting) {
        const existingLangs = getExistingLangsForMonth(month);
        let restoredAny = false;

        existingLangs.forEach(lang => {
          if (!finalSelectedLanguages.includes(lang)) {
            finalSelectedLanguages.push(lang);
            restoredAny = true;
          }
        });

        if (restoredAny) {
          setSelectedLanguagesForMonth(month.localId, finalSelectedLanguages);
        }
      }
      const autoFilled = autoFillMissingTranslations(month, finalSelectedLanguages);
      return cleanupNestedTranslations(autoFilled, finalSelectedLanguages);
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
        body={renderDialogBody('save')}
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
        body={renderDialogBody('publish')}
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