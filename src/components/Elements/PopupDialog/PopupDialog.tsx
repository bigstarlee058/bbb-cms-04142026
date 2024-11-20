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

    <div className="space-y-4">
      {workoutsHistory.map(({ day, exercises }: UserWorkout) => (
        <div key={day} className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-md font-semibold text-gray-900">{day}</h3>
          <div className="space-y-2 mt-2">
            {exercises?.map(({ status, sets, reps, weight, rest }: DayExercise, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg flex items-center space-x-4">
                <span className="text-sm text-gray-600">{sets} Sets</span>
                <span className="text-sm text-gray-600">of {reps} reps</span>
                <span className="text-sm text-gray-600">with {weight} kg</span>
                <span className={`text-sm ${status === 'Completed' ? 'text-green-500' : 'text-red-500'}`}>
                  {status}
                </span>
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
