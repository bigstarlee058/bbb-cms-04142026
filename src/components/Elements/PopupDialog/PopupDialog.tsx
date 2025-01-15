import { ExclamationIcon, InformationCircleIcon } from '@heroicons/react/outline';

import * as React from 'react';

import { Button } from '@/components/Elements/Button';
import { Dialog, DialogTitle } from '@/components/Elements/Dialog';
import { useDisclosure } from '@/hooks/useDisclosure';
import { DayExercise, UserWorkout } from '@/types';

export type PopupDialogProps = {
  triggerButton: React.ReactElement;
  name: string;
  email?: string;
  icon?: 'danger' | 'info';
  role?: number;
  isDone?: boolean;
  workoutsHistory: UserWorkout[];
};

const workouts = [
  {
    monthTitle: 'Glute Squad Special',
    weekTitle: 'Week 2',
    dayTitle: 'Workout Day 2',
    day: '10/09/2024',
    exercises: [
      {
        exerciseTitle: 'Pull up',
        sets: 5,
        reps: 6,
        weight: 7,
        rest: 8,
        status: 'Skipped'
      },
      {
        exerciseTitle: 'Push up',
        sets: 5,
        reps: 6,
        weight: 7,
        rest: 8,
        status: 'Completed'
      },
      {
        exerciseTitle: 'Pull up',
        sets: 5,
        reps: 6,
        weight: 7,
        rest: 8,
        status: 'Skipped'
      },
      {
        exerciseTitle: 'Push up',
        sets: 5,
        reps: 6,
        weight: 7,
        rest: 8,
        status: 'Completed'
      },
      {
        exerciseTitle: 'Pull up',
        sets: 5,
        reps: 6,
        weight: 7,
        rest: 8,
        status: 'Skipped'
      },
      {
        exerciseTitle: 'Push up',
        sets: 5,
        reps: 6,
        weight: 7,
        rest: 8,
        status: 'Completed'
      },
      {
        exerciseTitle: 'Pull & Push up',
        sets: 5,
        reps: 6,
        weight: 7,
        rest: 8,
        status: 'Completed'
      }
    ]
  },
  {
    monthTitle: 'Glute Squad Special',
    weekTitle: 'Week 3',
    dayTitle: 'Workout Day 1',
    day: '10/19/2024',
    exercises: [
      {
        exerciseTitle: 'Pull up',
        sets: 5,
        reps: 6,
        weight: 7,
        rest: 8,
        status: 'Skipped'
      },
      {
        exerciseTitle: 'Push up',
        sets: 5,
        reps: 6,
        weight: 7,
        rest: 8,
        status: 'Completed'
      },
      {
        exerciseTitle: 'Pull & Push up',
        sets: 5,
        reps: 6,
        weight: 7,
        rest: 8,
        status: 'Completed'
      }
    ]
  }
];

export const PopupDialog = ({
  name,
  email = '',
  role = 0,
  icon = 'info',
  isDone = false,
  triggerButton,
  workoutsHistory
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
  // Tab content
  const tabContents = [
    <div>Summary</div>,

    <div className="space-y-6 max-h-[500px] overflow-auto px-2">
      {workouts.map(({ monthTitle, weekTitle, dayTitle, day, exercises }, index) => (
        <div key={day} className='border-t'>
          <div className="flex flex-col md:flex-row justify-between items-center py-4 border-b">
            <div>
              <h3 className="text-md font-bold text-gray-900">{monthTitle}</h3>
              <div className="flex items-center space-x-6">
                <h4 className="text-sm font-semibold text-gray-700">{weekTitle}</h4>
                <p className="text-sm text-gray-500">{dayTitle}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 italic">{day}</p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {exercises.map(({ exerciseTitle, sets, reps, weight, rest, status }, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  status === 'Completed' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                }`}
              >
                <h5 className="text-md font-medium text-gray-800">{exerciseTitle}</h5>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>
                    <span className="font-semibold">Sets:</span> {sets}
                  </li>
                  <li>
                    <span className="font-semibold">Reps:</span> {reps}
                  </li>
                  <li>
                    <span className="font-semibold">Weight:</span> {weight} kg
                  </li>
                  <li>
                    <span className="font-semibold">Rest:</span> {rest} sec
                  </li>
                </ul>
                <p
                  className={`mt-3 text-sm font-semibold ${status === 'Completed' ? 'text-green-600' : 'text-red-600'}`}
                >
                  {status}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
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
