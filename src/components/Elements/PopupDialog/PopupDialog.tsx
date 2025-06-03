import { ExclamationIcon, InformationCircleIcon } from '@heroicons/react/outline';

import * as React from 'react';

import { Button } from '@/components/Elements/Button';
import { Dialog, DialogTitle } from '@/components/Elements/Dialog';
import { useDisclosure } from '@/hooks/useDisclosure';
import { User, UserWorkoutHistory } from '@/types';

export type PopupDialogProps = {
  triggerButton: React.ReactElement;
  name: string;
  email?: string;
  icon?: 'danger' | 'info';
  role?: number;
  isDone?: boolean;
  workoutsHistory: UserWorkoutHistory[];
  userData: User;
};

export const PopupDialog = ({
  name,
  email = '',
  role = 0,
  icon = 'info',
  isDone = false,
  triggerButton,
  workoutsHistory = [],
  userData
}: PopupDialogProps) => {
  const { close, open, isOpen } = useDisclosure();
  const [activeTab, setActiveTab] = React.useState(0); // New state for active tab
  const cancelButtonRef = React.useRef(null);
  React.useEffect(() => {
    if (isDone) {
      close();
    }
  }, [isDone, close]);
  const trigger = React.cloneElement(triggerButton, {
    onClick: open
  });

  const formatDateToLocal = (dateInput: string | Date): string => {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

    const formatted = date.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour12: false
    });

    return formatted.replace(",", "");
  };
  // Tab content
  const tabContents = [
    <div className="space-y-6 max-h-[500px] overflow-auto px-2">
      <h3 className="text-md font-bold text-gray-900">Role: {userData.role == 0 ? "User" : "Admin"}</h3>
      <p >Register Date: {userData.createdAt}</p>
    </div>,

    <div className="space-y-6 max-h-[500px] overflow-auto px-2">
      {workoutsHistory.sort((a: UserWorkoutHistory, b: UserWorkoutHistory) => new Date(a.date).getTime() - new Date(b.date).getTime()).reduce((acc, workout, index, arr) => {
        const isFirstOfDate = 
          index === 0 || 
          formatDateToLocal(workout.date) !== formatDateToLocal(arr[index - 1].date) || 
          workout.monthIndex !== arr[index - 1].monthIndex ||
          workout.weekIndex !== arr[index - 1].weekIndex ||
          workout.dayIndex !== arr[index - 1].dayIndex;

        if (isFirstOfDate) {
          const sameDateWorkouts = arr.filter(w => 
            formatDateToLocal(w.date) === formatDateToLocal(workout.date) &&
            w.monthIndex == workout.monthIndex &&
            w.weekIndex == workout.weekIndex &&
            w.dayIndex == workout.dayIndex
          );

          acc.push(
            <div key={workout.date} className='border-t'>
              <div className="flex flex-col md:flex-row justify-between items-center py-4 border-b">
                <div>
                  <h3 className="text-md font-bold text-gray-900">Month {workout.monthIndex} : {workout.monthTitle}</h3>
                  <div className="flex items-center space-x-6">
                    <h4 className="text-sm font-semibold text-gray-700">Week {workout.weekIndex} : {workout.weekTitle}</h4>
                    <p className="text-sm text-gray-500">Day {workout.dayIndex}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">{formatDateToLocal(workout.date)}</p>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {sameDateWorkouts.map((ex, exIndex) => (
                  <div
                    key={ex.date + exIndex}
                    className={`p-4 rounded-lg border ${
                      ex.status === 'Completed' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                    }`}
                  >
                    <h5 className="text-md font-medium text-gray-800">{ex.exerciseTitle}</h5>
                    <ul className="mt-2 text-sm text-gray-600 space-y-1">
                      <li><span className="font-semibold">Sets:</span> {ex.sets}</li>
                      <li><span className="font-semibold">Reps:</span> {ex.reps}</li>
                      <li><span className="font-semibold">Weight:</span> {ex.weight} kg</li>
                      <li><span className="font-semibold">Rest:</span> {ex.rest} sec</li>
                    </ul>
                    <p className={`mt-3 text-sm font-semibold ${ex.status === 'Completed' ? 'text-green-600' : 'text-red-600'}`}>
                      {ex.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return acc;
      }, [])}
    </div>,
    <div>Analysis</div>
  ];
  return (
    <>
      {trigger}
      <Dialog isOpen={isOpen} onClose={close} initialFocus={cancelButtonRef}>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            {icon === 'info' && (
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <InformationCircleIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
            )}
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <DialogTitle as="h3" className="text-md leading-6 font-medium text-gray-900">
                {name}
              </DialogTitle>
              {email && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{email}</p>
                </div>
              )}
            </div>
          </div>
          {/* New Tab Navigation positioned at the top left */}

          <div className="mt-4 flex space-x-2 justify-start">
            {['Summary', 'Activities', 'Analysis'].map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 rounded-md ${activeTab === index ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Tab Content Display */}
          <div className="mt-4">{tabContents[activeTab]}</div>
          <div className="mt-4 flex space-x-2 justify-end"></div>
        </div>
      </Dialog>
    </>
  );
};
