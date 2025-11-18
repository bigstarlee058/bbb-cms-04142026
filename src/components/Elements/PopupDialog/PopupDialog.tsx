import { InformationCircleIcon } from '@heroicons/react/outline';

import * as React from 'react';

import { Dialog, DialogTitle } from '@/components/Elements/Dialog';
import { User, UserWorkoutHistory } from '@/types';
export type PopupDialogProps = {
  triggerButton: React.ReactElement;
  name: string;
  email?: string;
  icon?: 'danger' | 'info';
  role?: number;
  isLoading?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  isDone?: boolean;
  workoutsHistory: UserWorkoutHistory[];
  userData: User;
};

export const PopupDialog = ({
  name,
  email = '',
  icon = 'info',
  triggerButton,
  workoutsHistory = [],
  userData,
  isLoading = false,
  isOpen = false,
  onClose,
}: PopupDialogProps) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const cancelButtonRef = React.useRef(null);

  const trigger = React.cloneElement(triggerButton, {
    onClick: () => {
      if (triggerButton.props.onClick) triggerButton.props.onClick();
    },
  });

  const formatDateToLocal = (dateInput: string | Date): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour12: false,
    }).replace(',', '');
  };

  const subscription = userData?.subscription;
  const isActive = subscription?.end_date ? new Date(subscription.end_date) > new Date() : false;

  const subscriptionType = (() => {
    if (!isActive) return 'Free';
    const type = subscription?.subscription_type || '';
    if (type.toLowerCase().includes('month')) return 'Monthly';
    if (type.toLowerCase().includes('year')) return 'Yearly';
    return 'Free';
  })();

  const systemName = userData?.deviceInfo?.systemName;
  const osVersion = userData?.deviceInfo?.osVersion;
  const platform = !systemName ? '-' : osVersion ? `${systemName} ${osVersion}` : systemName;
  const tabContents = [
    <div key="summary" className="space-y-6 max-h-[500px] overflow-auto px-2 relative">
      {isLoading || !userData ? (
        <div className="flex justify-center items-center p-4">Loading...</div>
      ) : (
        <>
          <h3 className="text-md font-bold text-gray-900">
            Role: {userData.role === 0 ? 'User' : 'Admin'}
          </h3>
          <p>
            Created On: {userData.createdAt
              ? `${new Date(userData.createdAt).toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })} PST`
              : 'N/A'}
          </p>
          <p>Source: {userData.uid === "-1" ? 'Mobile' : 'Wordpress'}</p>
          <p>Subscription: {subscriptionType}</p>
          <p>Platform: {platform}</p>
          <p>App Version: {userData?.deviceInfo?.appVersion || "-"}</p>
        </>
      )}
    </div>,
    <div key="activity" className="space-y-6 max-h-[500px] overflow-auto px-2 relative">
      {isLoading || !userData ? (
        <div className="flex justify-center items-center p-4">Loading...</div>
      ) : (
        workoutsHistory
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .reduce((acc, workout, index, arr) => {
            const isFirstOfDate =
              index === 0 ||
              formatDateToLocal(workout.date) !== formatDateToLocal(arr[index - 1].date) ||
              workout.monthIndex !== arr[index - 1].monthIndex ||
              workout.weekIndex !== arr[index - 1].weekIndex ||
              workout.dayIndex !== arr[index - 1].dayIndex;

            if (isFirstOfDate) {
              const sameDateWorkouts = arr.filter(
                (w) =>
                  formatDateToLocal(w.date) === formatDateToLocal(workout.date) &&
                  w.monthIndex === workout.monthIndex &&
                  w.weekIndex === workout.weekIndex &&
                  w.dayIndex === workout.dayIndex
              );

              acc.push(
                <div key={workout.date} className="border-t">
                  <div className="flex flex-col md:flex-row justify-between items-center py-4 border-b">
                    <div>
                      <h3 className="text-md font-bold text-gray-900">
                        Month {workout.monthIndex} : {workout.monthTitle}
                      </h3>
                      <div className="flex items-center space-x-6">
                        <h4 className="text-sm font-semibold text-gray-700">
                          Week {workout.weekIndex} : {workout.weekTitle}
                        </h4>
                        <p className="text-sm text-gray-500">Day {workout.dayIndex}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 italic">{formatDateToLocal(workout.date)}</p>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {sameDateWorkouts.map((ex, exIndex) => (
                      <div
                        key={ex.date + exIndex}
                        className={`p-4 rounded-lg border ${ex.status === 'Completed'
                            ? 'bg-green-50 border-green-300'
                            : 'bg-red-50 border-red-300'
                          }`}
                      >
                        <h5 className="text-md font-medium text-gray-800">{ex.exerciseTitle}</h5>
                        <ul className="mt-2 text-sm text-gray-600 space-y-1">
                          <li>
                            <span className="font-semibold">Sets:</span> {ex.sets}
                          </li>
                          <li>
                            <span className="font-semibold">Reps:</span> {ex.reps}
                          </li>
                          <li>
                            <span className="font-semibold">Weight:</span> {ex.weight} kg
                          </li>
                          <li>
                            <span className="font-semibold">Rest:</span> {ex.rest} sec
                          </li>
                        </ul>
                        <p
                          className={`mt-3 text-sm font-semibold ${ex.status === 'Completed' ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                          {ex.status}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            return acc;
          }, [] as React.ReactNode[])
      )}
    </div>,
    <div key="analysis" className="space-y-6 max-h-[500px] overflow-auto px-2 relative">
      {isLoading || !userData ? (
        <div className="flex justify-center items-center p-4">Loading...</div>
      ) : (
        <div>Analysis content here</div>
      )}
    </div>,
  ];

  return (
    <>
      {trigger}
      <Dialog isOpen={isOpen} onClose={onClose} initialFocus={cancelButtonRef}>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            {icon === 'info' && (
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <InformationCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <DialogTitle as="h3" className="text-md leading-6 font-medium text-gray-900">
                {name}
              </DialogTitle>
              {email && <p className="text-sm text-gray-500">{email}</p>}
            </div>
          </div>
          <div className="mt-4 flex space-x-2 justify-start">
            {['Summary', 'Activity', 'Analysis'].map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 rounded-md ${activeTab === index ? 'bg-[#9a354e] text-white' : 'bg-gray-200'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-4">{tabContents[activeTab]}</div>
        </div>
      </Dialog>
    </>
  );
};
