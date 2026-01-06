import { InformationCircleIcon, ClipboardCopyIcon, RefreshIcon } from '@heroicons/react/outline';

import * as React from 'react';
import { useNotificationStore } from '@/stores/notifications';
import { Dialog, DialogTitle } from '@/components/Elements/Dialog';
import { User, UserWorkoutHistory, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { formatDate } from '@/utils/format';
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
  const { addNotification } = useNotificationStore();
  const [activeTab, setActiveTab] = React.useState(0);
  const cancelButtonRef = React.useRef(null);
  const [newPassword, setNewPassword] = React.useState('');
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [isUpdatingPw, setIsUpdatingPw] = React.useState(false);
  const [passwordSet, setPasswordSet] = React.useState(false);
  const [lastSetPassword, setLastSetPassword] = React.useState('');
  const [tempPassword, setTempPassword] = React.useState('');
  const [tempExpiresAt, setTempExpiresAt] = React.useState('');
  const [isLoadingTemp, setIsLoadingTemp] = React.useState(false);
  const [securityMode, setSecurityMode] = React.useState<'temp' | 'reset'>('reset');
  React.useEffect(() => {
    if (activeTab === 3) {
      generatePassword();
      setPasswordSet(false);
      setLastSetPassword('');
    }
  }, [activeTab]);
  React.useEffect(() => {
    if (securityMode === "temp" && activeTab === 3) {
      fetchTempPassword();
    }
  }, [activeTab, securityMode])
  const fetchTempPassword = async () => {
    setIsLoadingTemp(true);
    try {
      const res = await axios.get(`/users/admin/${userData._id}/gtp`);
      setTempPassword(res?.data?.tempPassword || '');
      setTempExpiresAt(res?.data?.expiresAt || '');
    } catch (e) {
      setTempPassword('');
      setTempExpiresAt('');
    } finally {
      setIsLoadingTemp(false);
    }
  };
  const handleGenerateTempPassword = async () => {
    setIsLoadingTemp(true);
    try {
      const res = await axios.post(`/users/admin/${userData._id}/gtp`);
      setTempPassword(res.data?.tempPassword);
      setTempExpiresAt(res.data?.expiresAt);
      addNotification({
        type: 'success',
        title: 'Temporary password generated.',
      });
    } catch (e) {
      addNotification({
        type: 'error',
        title: 'Failed to generate password',
      });
    } finally {
      setIsLoadingTemp(false);
    }
  };
  const generatePassword = () => {
    const chars = "0123456789";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    setCopySuccess(false);
  };

  const copyToClipboard = () => {
    const textToCopy = lastSetPassword || newPassword;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) return;
    setIsUpdatingPw(true);
    try {
      const response = await axios.post(`/users/admin/${userData._id}/reset-password`, {
        password: newPassword
      }) as ResponseMessage;
      setLastSetPassword(newPassword);
      setPasswordSet(true);
      setNewPassword('');
      addNotification({
        type: 'success',
        title: response?.message || "Password updated successfully!",
      });

    } catch (e: any) {
      addNotification({
        type: 'error',
        title: 'Update failed',
        message: e?.message || "Error updating password. Please try again.",
      });
    } finally {
      setIsUpdatingPw(false);
    }
  };
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
          <p>Source: {userData.singuptype === "mobile" ? 'Mobile' : 'Wordpress'}</p>
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

    <div key="security" className="space-y-6 max-h-[300px] overflow-auto px-2 relative p-1">
      <div className="flex gap-2 mb-4">
        {[
          { value: 'reset', label: 'Reset Password' },
          { value: 'temp', label: 'Temporary Password' },
        ].map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setSecurityMode(value as 'reset' | 'temp')}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${securityMode === value
              ? 'bg-[#9a354e] text-white border-[#9a354e]'
              : 'bg-white text-gray-600 border-gray-300 hover:border-[#9a354e]'
              }`}
          >
            {label}
          </button>
        ))}
      </div>
      {securityMode === "temp" && (
        <div className="mt-6 border rounded-lg p-6 space-y-4">
          {isLoadingTemp ? (
            <p>Loading...</p>
          ) : tempPassword === '' ? (
            <>
              <p>You do not have a temporary password for this user.</p>
              <button
                onClick={handleGenerateTempPassword}
                className="px-4 py-2 bg-[#9a354e] text-white rounded-md"
              >
                Generate Temporary Password
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between w-full mt-2">
                <div
                  onClick={() => {
                    navigator.clipboard.writeText(tempPassword);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  }}
                  className="flex items-center space-x-3 bg-[#9a354e] bg-opacity-10 border-2 border-[#9a354e]
               rounded-lg px-4 py-2 cursor-pointer hover:bg-opacity-20 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="h-5 w-5 text-[#9a354e]" xmlns="http://www.w3.org/2000/svg" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-[#9a354e]">Temp:</span>
                  </div>

                  <div className="text-xl font-bold font-mono tracking-wider text-gray-900">
                    {tempPassword}
                  </div>

                  <div className="flex items-center space-x-1 text-[#9a354e]">
                    <ClipboardCopyIcon className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      {copySuccess ? '✓' : 'Copy'}
                    </span>
                  </div>
                </div>
                <div className="mx-4 flex-1 text-center text-sm text-gray-600 whitespace-nowrap">
                  Valid Until: {formatDate(tempExpiresAt)}
                </div>
                <button
                  onClick={handleGenerateTempPassword}
                  className="px-4 py-2 bg-[#9a354e] text-white rounded-md border border-[#9a354e]
               hover:bg-[#802a3f] whitespace-nowrap transition-colors"
                >
                  Generate New
                </button>

              </div>
            </>
          )}

        </div>
      )}
      {securityMode === "reset" && (
        <div className="bg-gray-50 border rounded-lg p-6 space-y-4">

          <div className="flex items-center justify-between gap-4">
            {passwordSet && lastSetPassword && (
              <div
                onClick={copyToClipboard}
                className="flex items-center space-x-3 bg-[#9a354e] bg-opacity-10 border-2 border-[#9a354e] rounded-lg px-4 py-2 cursor-pointer hover:bg-opacity-20 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-[#9a354e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-[#9a354e]">Set:</span>
                </div>

                <div className="text-xl font-bold font-mono tracking-wider text-gray-900">
                  {lastSetPassword}
                </div>

                <div className="flex items-center space-x-1 text-[#9a354e]">
                  <ClipboardCopyIcon className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {copySuccess ? '✓' : 'Copy'}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">

            <label className="block text-sm font-medium text-gray-700">Generate or enter a new password.</label>
            <div className="flex rounded-md shadow-sm">
              <input
                type="text"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setCopySuccess(false);
                }}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:ring-[#9a354e] focus:border-[#9a354e] text-2xl font-bold font-mono tracking-wider text-center"
                placeholder="New Password"
                maxLength={21}
              />
              <button
                type="button"
                onClick={generatePassword}
                className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-[#9a354e] focus:border-[#9a354e]"
                title="Generate 8-digit PIN"
              >
                <RefreshIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <span>Generate</span>
              </button>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={!newPassword || isUpdatingPw}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
          ${!newPassword || isUpdatingPw ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#9a354e] hover:bg-[#802a3f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9a354e]'}`}
            >
              {isUpdatingPw ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
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
            {['Summary', 'Activity', 'Analysis', 'Security'].map((tab, index) => (
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
