import { InformationCircleIcon, ClipboardCopyIcon, RefreshIcon } from '@heroicons/react/outline';
import { useQuery } from 'react-query';
import { fetchUserEvents } from '@/features/users/api';
import { UserEvent } from '@/types';
import * as React from 'react';
import { useNotificationStore } from '@/stores/notifications';
import { Dialog, DialogTitle } from '@/components/Elements/Dialog';
import { User, UserWorkoutHistory, ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';
import { formatDate } from '@/utils/format';
import Pagination from '@/components/Elements/Pagination';

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
  const [eventsPage, setEventsPage] = React.useState(1);
  const [sourceFilter, setSourceFilter] = React.useState<string>("");
  const [actionFilter, setActionFilter] = React.useState<string>("");
  const [expandedEventId, setExpandedEventId] = React.useState<string | null>(null);
  const formatDateToLocal = React.useCallback((dateInput: string | Date): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour12: false,
    }).replace(',', '');
  }, []);

  const groupedWorkouts = React.useMemo(() => {
    if (!workoutsHistory?.length) return [];

    const sorted = [...workoutsHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const groups: Array<{
      key: string;
      date: string;
      monthIndex: number;
      monthTitle: string;
      weekIndex: number;
      weekTitle: string;
      dayIndex: number;
      workouts: typeof workoutsHistory;
    }> = [];

    sorted.forEach((workout) => {
      const dateKey = `${formatDateToLocal(workout.date)}_${workout.monthIndex}_${workout.weekIndex}_${workout.dayIndex}`;

      const existingGroup = groups.find(g => g.key === dateKey);

      if (existingGroup) {
        existingGroup.workouts.push(workout);
      } else {
        groups.push({
          key: dateKey,
          date: formatDateToLocal(workout.date),
          monthIndex: workout.monthIndex,
          monthTitle: workout.monthTitle,
          weekIndex: workout.weekIndex,
          weekTitle: workout.weekTitle,
          dayIndex: workout.dayIndex,
          workouts: [workout],
        });
      }
    });

    return groups;
  }, [workoutsHistory, formatDateToLocal]);

  const subscriptionType = React.useMemo(() => {
  const subscription = userData?.subscription;
  
  const isActive = subscription?.end_date 
    ? new Date(subscription.end_date) > new Date() 
    : false;
  if (!isActive) return 'Free';

  const type = (subscription?.subscription_type || '').toLowerCase();

  if (type.includes('year') || type.includes('annual')) {
    return 'Yearly';
  } 
  
  if (type.includes('quarter') || type.includes('3month')) {
    return 'Quarterly';
  } 
  
  if (type.includes('month')) {
    return 'Monthly';
  } 
  
  if (type.includes('week')) {
    return 'Weekly';
  } 
  
  if (type.includes('trial')) {
    return 'Trial';
  }
  return 'Monthly';
  
}, [userData?.subscription]);

  const platform = React.useMemo(() => {
    const systemName = userData?.deviceInfo?.systemName;
    const osVersion = userData?.deviceInfo?.osVersion;
    return !systemName ? '-' : osVersion ? `${systemName} ${osVersion}` : systemName;
  }, [userData?.deviceInfo]);
  const { data: eventsData, isLoading: isLoadingEvents } = useQuery(
    ['user-events', userData?._id, sourceFilter, actionFilter, eventsPage],
    () => fetchUserEvents({
      userId: userData?._id,
      source: sourceFilter || undefined,
      action: actionFilter || undefined,
      page: eventsPage,
      perPage: 10,
    }),
    {
      enabled: activeTab === 4 && !!userData?._id,
    }
  );
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
  const uniqueSources = React.useMemo(() => {
    if (!eventsData?.events?.length) return [];
    return [...new Set(eventsData.events.map((e: UserEvent) => e.source))];
  }, [eventsData?.events]);

  const uniqueActions = React.useMemo(() => {
    if (!eventsData?.events?.length) return [];
    const actions = eventsData.events
      .filter((e: UserEvent) => !sourceFilter || e.source === sourceFilter)
      .map((e: UserEvent) => e.action);
    return [...new Set(actions)];
  }, [eventsData?.events, sourceFilter]);
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <div className="space-y-6 max-h-[500px] overflow-auto px-2 relative">
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
          </div>
        );

            case 1:
        return (
          <div className="space-y-6 max-h-[500px] overflow-auto px-2 relative">
            {isLoading || !userData ? (
              <div className="flex justify-center items-center p-4">Loading...</div>
            ) : (
              groupedWorkouts.map((group) => (
                <div key={group.key} className="border-t">
                  <div className="flex flex-col md:flex-row justify-between items-center py-4 border-b">
                    <div>
                      <h3 className="text-md font-bold text-gray-900">
                        Month {group.monthIndex} : {group.monthTitle}
                      </h3>
                      <div className="flex items-center space-x-6">
                        <h4 className="text-sm font-semibold text-gray-700">
                          Week {group.weekIndex} : {group.weekTitle}
                        </h4>
                        <p className="text-sm text-gray-500">Day {group.dayIndex}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 italic">{group.date}</p>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {group.workouts.map((ex, exIndex) => {
                      const rawWeight = Number(ex.weight) || 0;
                      const isMetric = userData?.settings?.isEnabledMetricUnits ?? false;
                      const finalWeight = isMetric 
                        ? rawWeight * 0.45359237 
                        : rawWeight;
                      const displayWeight = parseFloat(finalWeight.toFixed(2));
                      const unitLabel = isMetric ? 'kg' : 'lbs';
                      return (
                        <div
                          key={`${ex.date}_${exIndex}`}
                          className={`p-4 rounded-lg border ${
                            ex.status === 'Completed'
                              ? 'bg-green-50 border-green-300'
                              : 'bg-red-50 border-red-300'
                          }`}
                        >
                          <h5 className="text-md font-medium text-gray-800">
                            {ex.exerciseTitle}
                          </h5>
                          <ul className="mt-2 text-sm text-gray-600 space-y-1">
                            <li>
                              <span className="font-semibold">Sets:</span> {ex.sets}
                            </li>
                            <li>
                              <span className="font-semibold">Reps:</span> {ex.reps}
                            </li>
                            <li>
                              <span className="font-semibold">Weight:</span>{' '}
                              {displayWeight} {unitLabel}
                            </li>
                            <li>
                              <span className="font-semibold">Rest:</span> {ex.rest} sec
                            </li>
                          </ul>
                          <p
                            className={`mt-3 text-sm font-semibold ${
                              ex.status === 'Completed'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {ex.status}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 max-h-[500px] overflow-auto px-2 relative">
            {isLoading || !userData ? (
              <div className="flex justify-center items-center p-4">Loading...</div>
            ) : (
              <div>Analysis content here</div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 max-h-[300px] overflow-auto px-2 relative p-1">
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
                        className="flex items-center space-x-3 bg-[#9a354e] bg-opacity-10 border-2 border-[#9a354e] rounded-lg px-4 py-2 cursor-pointer hover:bg-opacity-20 transition-colors whitespace-nowrap"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="h-5 w-5 text-[#9a354e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-[#9a354e]">Temp:</span>
                        </div>
                        <div className="text-xl font-bold font-mono tracking-wider text-gray-900">
                          {tempPassword}
                        </div>
                        <div className="flex items-center space-x-1 text-[#9a354e]">
                          <ClipboardCopyIcon className="h-4 w-4" />
                          <span className="text-xs font-medium">{copySuccess ? '✓' : 'Copy'}</span>
                        </div>
                      </div>
                      <div className="mx-4 flex-1 text-center text-sm text-gray-600 whitespace-nowrap">
                        Valid Until: {formatDate(tempExpiresAt)}
                      </div>
                      <button
                        onClick={handleGenerateTempPassword}
                        className="px-4 py-2 bg-[#9a354e] text-white rounded-md border border-[#9a354e] hover:bg-[#802a3f] whitespace-nowrap transition-colors"
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
                        <span className="text-xs font-medium">{copySuccess ? '✓' : 'Copy'}</span>
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
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${!newPassword || isUpdatingPw ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#9a354e] hover:bg-[#802a3f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9a354e]'}`}
                  >
                    {isUpdatingPw ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 4: {
        const getSourceColors = (source: string) => {
          if (source === 'rc') return {
            name: 'RevenueCat',
            badge: 'bg-purple-600 text-white',
            dot: 'bg-purple-500',
          };
          if (source === 'wp') return {
            name: 'Wordpress',
            badge: 'bg-orange-600 text-white',
            dot: 'bg-orange-500',
          };
          return {
            name: 'Admin',
            badge: 'bg-red-600 text-white',
            dot: 'bg-red-500',
          };
        };

        const formatEventDate = (dateString: string): string => {
          const date = new Date(dateString);
          return date.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
        };

        const formatChangeValue = (value: string | undefined, field: string) => {
          if (!value || value === 'none' || value === '') return 'none';
          if (field === 'endDate' || field === 'purchaseDate') {
            try {
              const date = new Date(value);
              if (isNaN(date.getTime())) return value;
              return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
            } catch {
              return value;
            }
          }
          if (field === 'status') {
            if (value === 'free_user') return 'Free';
            if (value === 'subscribed_user') return 'Subscribed';
          }
          return value;
        };

        return (
          <div className="flex flex-col max-h-[450px] overflow-hidden">
            <div className="flex items-center justify-between gap-2 pb-2 border-b flex-shrink-0">
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={sourceFilter}
                    onChange={(e) => {
                      setSourceFilter(e.target.value);
                      setActionFilter("");
                      setEventsPage(1);
                    }}
                    className="appearance-none border-2 border-gray-300 rounded-md px-3 py-1.5 pr-8 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-gray-400 focus:border-gray-400 cursor-pointer transition-colors"
                  >
                    <option value="">All Sources</option>
                    {uniqueSources.map((source: string) => {
                      const colors = getSourceColors(source);
                      return (
                        <option key={source} value={source}>
                          {colors.name}
                        </option>
                      );
                    })}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={actionFilter}
                    onChange={(e) => {
                      setActionFilter(e.target.value);
                      setEventsPage(1);
                    }}
                    className="appearance-none border-2 border-gray-300 rounded-md px-3 py-1.5 pr-8 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-gray-400 focus:border-gray-400 cursor-pointer transition-colors"
                  >
                    <option value="">All Actions</option>
                    {uniqueActions.map((action: string) => (
                      <option key={action} value={action}>
                        {action.replace(/_/g, " ").replace(/\./g, " ")}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">{eventsData?.total || 0} events</span>
                <button
                  onClick={() => {
                    setEventsPage(1);
                  }}
                  disabled={isLoadingEvents}
                  className={`rounded-md border-2 px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 ${isLoadingEvents
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'text-[#9a354e] border-gray-300 hover:text-white hover:bg-[#9a354e] hover:border-[#9a354e]'
                    }`}
                >
                  <RefreshIcon className={`h-4 w-4 ${isLoadingEvents ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {isLoadingEvents ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full" />
              </div>
            ) : !eventsData?.events?.length ? (
              <div className="text-center py-12 text-gray-400 text-sm">No events found</div>
            ) : (
              <>
                <div className="overflow-auto flex-1 mt-2 space-y-1.5">
                  {eventsData.events.map((event: UserEvent) => {
                    const sourceColors = getSourceColors(event.source);
                    const changes = event.summary?.changes;
                    const hasChanges = changes && Object.keys(changes).length > 0;
                    const isExpanded = expandedEventId === event._id;
                    const hasDetails = hasChanges || !event.success;

                    return (
                      <div key={event._id} className="border border-gray-200 rounded-md overflow-hidden bg-white">
                        <div
                          className={`px-2 py-1.5 bg-gray-50 border-b border-gray-200 ${hasDetails ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                          onClick={() => hasDetails && setExpandedEventId(isExpanded ? null : event._id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${event.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${sourceColors.badge}`}>
                                {sourceColors.name}
                              </span>
                              <span className="text-xs font-semibold text-gray-900 uppercase">
                                {event.action.replace(/_/g, " ").replace(/\./g, " ")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-500">
                                {formatEventDate(event.createdAt)}
                              </span>
                              {hasDetails && (
                                <span className="text-gray-400 text-xs">
                                  {isExpanded ? '▼' : '▶'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {isExpanded && hasDetails && (
                          <div className="px-2 py-1.5">
                            {!event.success && event.errorMessage ? (
                              <div className="text-xs text-red-600 py-1">
                                <span className="font-semibold">ERROR:</span> {event.errorMessage}
                              </div>
                            ) : hasChanges ? (
                              <table className="w-full text-[10px] border-collapse">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-1 px-1 font-semibold text-gray-600 w-16"></th>
                                    {changes.type && <th className="text-left py-1 px-1 font-semibold text-gray-600">Type</th>}
                                    {changes.price && <th className="text-left py-1 px-1 font-semibold text-gray-600">Price</th>}
                                    {changes.status && <th className="text-left py-1 px-1 font-semibold text-gray-600">Status</th>}
                                    {changes.endDate && <th className="text-left py-1 px-1 font-semibold text-gray-600">Expires</th>}
                                    {changes.purchaseDate && <th className="text-left py-1 px-1 font-semibold text-gray-600">Purchase</th>}
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b border-gray-100">
                                    <td className="py-1 px-1 font-medium text-gray-500">Before</td>
                                    {changes.type && <td className="py-1 px-1 text-gray-700">{formatChangeValue(changes.type.from, 'type')}</td>}
                                    {changes.price && <td className="py-1 px-1 text-gray-700">{formatChangeValue(changes.price.from, 'price')}</td>}
                                    {changes.status && <td className="py-1 px-1 text-gray-700">{formatChangeValue(changes.status.from, 'status')}</td>}
                                    {changes.endDate && <td className="py-1 px-1 text-gray-700">{formatChangeValue(changes.endDate.from, 'endDate')}</td>}
                                    {changes.purchaseDate && <td className="py-1 px-1 text-gray-700">{formatChangeValue(changes.purchaseDate.from, 'purchaseDate')}</td>}
                                  </tr>
                                  <tr>
                                    <td className="py-1 px-1 font-medium text-gray-500">After</td>
                                    {changes.type && <td className="py-1 px-1 font-medium text-gray-900">{formatChangeValue(changes.type.to, 'type')}</td>}
                                    {changes.price && <td className="py-1 px-1 font-medium text-gray-900">{formatChangeValue(changes.price.to, 'price')}</td>}
                                    {changes.status && <td className="py-1 px-1 font-medium text-gray-900">{formatChangeValue(changes.status.to, 'status')}</td>}
                                    {changes.endDate && <td className="py-1 px-1 font-medium text-gray-900">{formatChangeValue(changes.endDate.to, 'endDate')}</td>}
                                    {changes.purchaseDate && <td className="py-1 px-1 font-medium text-gray-900">{formatChangeValue(changes.purchaseDate.to, 'purchaseDate')}</td>}
                                  </tr>
                                </tbody>
                              </table>
                            ) : null}

                            {event.performedBy && (
                              <div className="text-[10px] text-gray-500 mt-1 pt-1 border-t border-gray-100">
                                by: {event.performedBy}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {eventsData.total > 10 && (
                  <div className="flex items-center justify-between pt-2 border-t flex-shrink-0 mt-2">
                    <span className="text-xs text-gray-500">
                      {((eventsPage - 1) * 10) + 1}-{Math.min(eventsPage * 10, eventsData.total)} of {eventsData.total}
                    </span>
                    <Pagination
                      currentPage={eventsPage}
                      lastPage={Math.ceil(eventsData.total / 10)}
                      maxLength={7}
                      setCurrentPage={setEventsPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };
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
            {['Summary', 'Activity', 'Analysis', 'Security', 'Events'].map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 rounded-md ${activeTab === index ? 'bg-bbb text-white' : 'bg-gray-200'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-4">{renderTabContent()}</div>
        </div>
      </Dialog>
    </>
  );
};
