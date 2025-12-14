import { InformationCircleIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { Button } from '@/components/Elements/Button';
import { Dialog, DialogTitle } from '@/components/Elements/Dialog';
import { useDisclosure } from '@/hooks/useDisclosure';
import { updateUserSubscription } from '../api';
import { useMutation } from 'react-query';
import { useNotificationStore } from '@/stores/notifications';
import { formatDate } from '@/utils/format';
import axios from 'axios';

interface SubscriptionProps {
  id: string;
  name?: string;
  email?: string;
  uid?: string;
  onClose?: () => void;
  currentSubscription?: {
    subscription_type?: 'free' | 'monthly' | 'yearly';
    price?: string;
    purchase_date?: string | number;
    end_date?: string | number;
  };
}

export const ManageSubscription: React.FC<SubscriptionProps> = ({
  id,
  name,
  uid,
  email,
  onClose,
  currentSubscription,
}) => {
  const { isOpen, close } = useDisclosure(true);
  const cancelButtonRef = React.useRef(null);
  const { addNotification } = useNotificationStore();
  const toLocalDateTime = (date: string | number | Date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const originalValues = React.useMemo(() => ({
    type: currentSubscription?.subscription_type || 'free',
    price: (() => {
      const raw = currentSubscription?.price;
      if (!raw) return 0;
      const numericString = raw.replace(/[^0-9.,]/g, "");
      return parseFloat(numericString.replace(/,/g, "")) || 0;
    })(),
    start: currentSubscription?.purchase_date
      ? toLocalDateTime(new Date(currentSubscription.purchase_date))
      : '',
    end: currentSubscription?.end_date
      ? toLocalDateTime(new Date(currentSubscription.end_date))
      : '',
    currency: currentSubscription?.price?.replace(/[^a-zA-Z]/g, "") ?? "USD",
  }), [currentSubscription]);
  const [subscriptionData, setSubscriptionData] = React.useState({
    type: originalValues.type,
    price: originalValues.price,
    startDate: originalValues.start,
    endDate: originalValues.end,
    currency: originalValues.currency,
  });

  const [fetchState, setFetchState] = React.useState({
    isFetching: false,
    lastRefreshed: null,
    userNotFound: false,
    isExpired: false,
  });


  const [acknowledged, setAcknowledged] = React.useState(false);
  const [source, setSource] = React.useState<'database' | 'wordpress' | 'revenuecat'>('database');
  const currentSourceRef = React.useRef(source);
  const hasDatabaseEditsRef = React.useRef(false);
  const justSwitchedSourceRef = React.useRef(false);
  React.useEffect(() => {
    setAcknowledged(false);
  }, [subscriptionData]);

  React.useEffect(() => {
    currentSourceRef.current = source;
    hasDatabaseEditsRef.current = false;
    if (source === 'database') {
      justSwitchedSourceRef.current = true;
      setFetchState({
        isFetching: false,
        lastRefreshed: null,
        userNotFound: false,
        isExpired: false,
      });

      setSubscriptionData({
        type: originalValues.type,
        price: originalValues.price,
        startDate: originalValues.start,
        endDate: originalValues.end,
        currency: originalValues.currency,
      });

      setAcknowledged(false);
      setTimeout(() => {
        justSwitchedSourceRef.current = false;
      }, 100);
    } else {
      handleRefetch();
    }
  }, [source, originalValues]);
  React.useEffect(() => {
    if (source !== 'database') return;
    if (hasDatabaseEditsRef.current) return;
    if (justSwitchedSourceRef.current) return;

    const now = new Date();
    const startDate = toLocalDateTime(now);

    if (subscriptionData.type === 'monthly') {
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);

      setSubscriptionData(prev => ({
        ...prev,
        price: 29.95,
        startDate: startDate,
        endDate: toLocalDateTime(endDate),
        currency: 'USD',
      }));
    } else if (subscriptionData.type === 'yearly') {
      const endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 1);

      setSubscriptionData(prev => ({
        ...prev,
        price: 299.95,
        startDate: startDate,
        endDate: toLocalDateTime(endDate),
        currency: 'USD',
      }));
    } else if (subscriptionData.type === 'free') {
      setSubscriptionData(prev => ({
        ...prev,
        price: 0,
        startDate: '',
        endDate: '',
        currency: 'USD',
      }));
    }
  }, [subscriptionData.type, source]);
  const fetchFromWordPress = async (customerId: string) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_WOOCOMMERCE_API_URL}/wp-json/wc/v3/subscriptions?customer=${customerId}`,
        {
          auth: {
            username: process.env.REACT_APP_WOOCOMMERCE_CONSUMER_KEY as string,
            password: process.env.REACT_APP_WOOCOMMERCE_CONSUMER_SECRET as string,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch subscriptions from WordPress:', error);
      throw new Error(
        error?.response?.data?.message ||
        'Unable to fetch subscriptions from WordPress'
      );
    }
  };

  const fetchFromRevenueCat = async (userId: string) => {
    try {
      const response = await axios.get(
        `https://api.revenuecat.com/v2/projects/${process.env.REACT_APP_REVENUECAT_PROJECT_ID}/customers/${userId}/subscriptions`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_REVENUECAT_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      console.error('Failed to fetch subscriptions from RevenueCat:', error);
      throw new Error(
        error?.response?.data?.message ||
        'Unable to fetch subscriptions from RevenueCat'
      );
    }
  };

  const processRevenueCatSubscription = (data: any) => {
    const today = new Date();

    const subscriptions = data?.items || [];

    if (!subscriptions.length) {
      return {
        purchase_date: '',
        end_date: '',
        price: 0,
        currency: 'USD',
        subscription_type: 'free' as const,
      };
    }
    const activeSubscription = subscriptions.find(
      (sub: any) => sub.status === 'active' || sub.gives_access === true
    );
    const subscription = activeSubscription || subscriptions.sort(
      (a: any, b: any) => b.current_period_ends_at - a.current_period_ends_at
    )[0];
    const purchase_date = subscription?.starts_at
      ? toLocalDateTime(new Date(subscription.starts_at))
      : toLocalDateTime(today);
    const end_date = subscription?.ends_at || subscription?.current_period_ends_at
      ? toLocalDateTime(new Date(subscription.ends_at || subscription.current_period_ends_at))
      : toLocalDateTime(today);
    const price = parseFloat(subscription?.total_revenue_in_usd?.gross || "0");
    const currency = subscription?.total_revenue_in_usd?.currency || "USD";
    let subscription_type: 'free' | 'monthly' | 'yearly' = 'free';

    const productId = subscription?.product_id || '';
    if (productId === process.env.REACT_APP_REVENUECAT_YEARLY_PRODUCT_ID) {
      subscription_type = 'yearly';
    } else if (productId === process.env.REACT_APP_REVENUECAT_MONTHLY_PRODUCT_ID) {
      subscription_type = 'monthly';
    } else if (productId) {
      const productIdLower = productId.toLowerCase();
      if (productIdLower.includes('year') || productIdLower.includes('annual')) {
        subscription_type = 'yearly';
      } else if (productIdLower.includes('month')) {
        subscription_type = 'monthly';
      }
    }

    return {
      purchase_date,
      end_date,
      price,
      currency,
      subscription_type,
      status: subscription?.status,
      gives_access: subscription?.gives_access,
    };
  };

  const processWordPressSubscription = (subscription: any) => {
    const today = new Date();
    const purchase_date = subscription?.last_payment_date_gmt
      ? toLocalDateTime(new Date(subscription.last_payment_date_gmt))
      : toLocalDateTime(today);

    let end_date: string;
    if (subscription?.end_date_gmt && subscription.end_date_gmt !== "") {
      end_date = toLocalDateTime(new Date(subscription.end_date_gmt));
    } else if (subscription?.next_payment_date_gmt && subscription.next_payment_date_gmt !== "") {
      end_date = toLocalDateTime(new Date(subscription.next_payment_date_gmt));
    } else {
      end_date = toLocalDateTime(today);
    }

    const endDateTimestamp = new Date(end_date).getTime();
    const currentTimestamp = Date.now();
    const isExpired = endDateTimestamp < currentTimestamp;

    let price = 0;
    if (subscription?.line_items?.length) {
      price = subscription.line_items.reduce((total: number, item: any) => {
        return total + parseFloat(item.subtotal || "0");
      }, 0);
    }

    const currency = subscription?.currency || "USD";
    let subscription_type: 'free' | 'monthly' | 'yearly' = 'free';

    if (subscription?.line_items?.length) {
      for (const item of subscription.line_items) {
        if (item.variation_id.toString() === process.env.REACT_APP_SUBSCRIPTION_YEAR_ID) {
          subscription_type = 'yearly';
          break;
        } else if (item.variation_id.toString() === process.env.REACT_APP_SUBSCRIPTION_MONTH_ID) {
          subscription_type = 'monthly';
          break;
        }
      }
    }

    return {
      purchase_date,
      end_date,
      price,
      currency,
      subscription_type,
      isExpired,
    };
  };
  const resetToFreeSubscription = () => {
    setSubscriptionData({
      type: 'free',
      price: 0,
      startDate: '',
      endDate: '',
      currency: 'USD',
    });
    setFetchState(prev => ({
      ...prev,
      lastRefreshed: new Date(),
      isFetching: false,
    }));
  };

  const handleRefetch = async () => {
    const fetchSource = source;
    setFetchState(prev => ({
      ...prev,
      isFetching: true,
      isExpired: false,
    }));

    try {
      if (fetchSource === 'wordpress') {
        const data = await fetchFromWordPress(uid);
        if (currentSourceRef.current !== fetchSource) return;

        if (!data || data.length === 0) {
          setFetchState({
            isFetching: false,
            lastRefreshed: new Date(),
            userNotFound: true,
            isExpired: false,
          });
          resetToFreeSubscription();
          return;
        }

        const activeSubscription = data.find(
          (s: any) => s.status === 'active' || s.status === 'pending-cancel'
        );

        const processed = processWordPressSubscription(activeSubscription);

        if (!activeSubscription || processed?.isExpired) {
          setFetchState({
            isFetching: false,
            lastRefreshed: new Date(),
            userNotFound: false,
            isExpired: processed?.isExpired || false,
          });
          resetToFreeSubscription();
          return;
        }

        setSubscriptionData({
          type: processed.subscription_type,
          price: processed.price,
          startDate: processed.purchase_date,
          endDate: processed.end_date,
          currency: processed.currency,
        });

        setFetchState({
          isFetching: false,
          lastRefreshed: new Date(),
          userNotFound: false,
          isExpired: false,
        });

      } else if (fetchSource === 'revenuecat') {
        const data = await fetchFromRevenueCat(id);
        if (currentSourceRef.current !== fetchSource) return;

        if (data === null) {
          setFetchState({
            isFetching: false,
            lastRefreshed: new Date(),
            userNotFound: true,
            isExpired: false,
          });
          resetToFreeSubscription();
          return;
        }

        if (!data.items || data.items.length === 0) {
          setFetchState(prev => ({
            ...prev,
            isFetching: false,
            userNotFound: false,
          }));
          return;
        }

        const processed = processRevenueCatSubscription(data);

        if (processed.subscription_type === 'free') {
          setSubscriptionData({
            type: 'free',
            price: 0,
            startDate: '',
            endDate: '',
            currency: 'USD',
          });
          setFetchState({
            isFetching: false,
            lastRefreshed: new Date(),
            userNotFound: false,
            isExpired: true,
          });
          return;
        }

        setSubscriptionData({
          type: processed.subscription_type,
          price: processed.price,
          startDate: processed.purchase_date,
          endDate: processed.end_date,
          currency: processed.currency,
        });

        setFetchState({
          isFetching: false,
          lastRefreshed: new Date(),
          userNotFound: false,
          isExpired: false,
        });
      }
    } catch (error: any) {
      if (currentSourceRef.current !== fetchSource) return;

      setFetchState(prev => ({
        ...prev,
        isFetching: false,
      }));

      addNotification({
        type: 'error',
        title: 'Refetch failed',
        message: error?.message || 'Failed to refresh data',
      });
    }
  };
  const isReadOnly = source !== 'database';
  const { mutate, isLoading } = useMutation(updateUserSubscription, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
      close();
      onClose?.();
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Update failed',
        message: err?.message || 'Something went wrong',
      });
    },
  });

  const formatDateTime = (date: Date) => {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${mm}/${dd} ${hh}:${min}:${ss}`;
  };
  const changes = [
    { field: "subscriptionType", current: subscriptionData.type, original: originalValues.type },
    { field: "price", current: subscriptionData.price, original: originalValues.price },
    { field: "customStart", current: subscriptionData.startDate, original: originalValues.start },
    { field: "customEnd", current: subscriptionData.endDate, original: originalValues.end },
  ]
    .filter(({ current, original }) => current !== original);

  const hasChanges = changes.length > 0;

  if (hasChanges) {
    console.log("Changes found:");
    changes.forEach(({ field, current, original }) => {
      console.log(`- ${field}: ${original} → ${current}`);
    });
  }

  const validationErrors = React.useMemo(() => {
    const errors: string[] = [];

    if (subscriptionData.type !== 'free') {
      if (subscriptionData.price < 0) {
        errors.push('Price cannot be negative');
      }
      if (subscriptionData.price === 0) {
        errors.push('Price must be greater than 0 for paid plans');
      }
      if (!subscriptionData.startDate) {
        errors.push('Purchase date is required');
      }
      if (!subscriptionData.endDate) {
        errors.push('End date is required');
      }
      if (subscriptionData.startDate && subscriptionData.endDate &&
        new Date(subscriptionData.endDate) <= new Date(subscriptionData.startDate)) {
        errors.push('End date must be after purchase date');
      }
    }

    return errors;
  }, [subscriptionData.type, subscriptionData.price, subscriptionData.startDate, subscriptionData.endDate]);

  const canSubmit = acknowledged && !isLoading && hasChanges && validationErrors.length === 0;

  const handleConfirm = () => {
    if (!canSubmit) return;

    const subscription = subscriptionData.type === 'free'
      ? {
        subscription_type: 'free',
        price: '0',
        user_subscription_status: 'free_user',
        purchase_date: null,
        end_date: null,
      }
      : {
        subscription_type: subscriptionData.type,
        price: subscriptionData.price.toString(),
        user_subscription_status: 'subscribed_user',
        purchase_date: subscriptionData.startDate,
        end_date: subscriptionData.endDate,
      };

    mutate({ userId: id, subscription });
  };

  const handleCancel = () => {
    close();
    onClose?.();
  };
  const sourceColors = {
    database: 'border-red-600 bg-red-600 text-white hover:bg-red-600',
    wordpress: 'border-orange-600 bg-orange-600 text-white hover:bg-orange-600',
    revenuecat: 'border-purple-600 bg-purple-600 text-white hover:bg-purple-600',
  };
  const currentType = originalValues?.type || 'free';
  const isUpgrade =
    (currentType === 'free' && subscriptionData?.type !== 'free') ||
    (currentType === 'monthly' && subscriptionData?.type === 'yearly');
  const isDowngrade =
    (currentType === 'yearly' && subscriptionData?.type !== 'yearly') ||
    (currentType !== 'free' && subscriptionData?.type === 'free');

  return (
    <Dialog isOpen={isOpen} onClose={handleCancel} initialFocus={cancelButtonRef}>
      <div
        className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left 
        overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
      >
        <div className="sm:flex sm:items-start">
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <DialogTitle as="h3" className="text-md leading-6 font-medium text-gray-900 flex items-center space-x-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <strong className="text-md text-gray-800 mt-1">Manage Subscription</strong>
            </DialogTitle>
            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <p className="font-medium text-gray-800">{name}</p>
              {email && (
                <p className="text-gray-600">{email}</p>
              )}
              <p>
                <span className="font-semibold">Current Plan:</span>{' '}
                {currentType === 'free'
                  ? 'Free'
                  : currentType === 'monthly'
                    ? 'Monthly'
                    : 'Yearly'}
              </p>
              {originalValues?.price>=0 && (
                <p>
                  <span className="font-semibold">Price:</span>{' '}
                  {originalValues.price} {originalValues.currency || "USD"}
                </p>
              )}

              {currentSubscription?.purchase_date && (
                <p>
                  <span className="font-semibold">Purchased:</span>{' '}
                  {formatDate(currentSubscription.purchase_date)}
                </p>
              )}

              {currentSubscription?.end_date && (
                <p>
                  <span className="font-semibold">Ends:</span>{' '}
                  {formatDate(currentSubscription.end_date)}
                </p>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex space-x-2">
                {[
                  { key: 'database', label: 'Database' },
                  { key: 'wordpress', label: 'WordPress' },
                  { key: 'revenuecat', label: 'RevenueCat' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className={`cursor-pointer rounded-md border px-3 py-1.5 text-center text-sm font-medium transition-all ${source === item.key
                      ? sourceColors[item.key]
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="radio"
                      name="source"
                      value={item.key}
                      checked={source === item.key}
                      onChange={(e) => {
                        const v = e.target.value as typeof source;
                        setSource(v);
                        setFetchState(prev => ({ ...prev, isFetching: v !== 'database' }));
                      }}
                      className="sr-only"
                    />
                    <span className="text-xs font-medium">{item.label}</span>
                  </label>
                ))}
              </div>

              {(source !== 'database' || (source === 'database' && hasChanges)) && (
                <div className="flex flex-col items-end space-y-0">
                  <button
                    type="button"
                    onClick={source === 'database' ? () => {
                      justSwitchedSourceRef.current = true;
                      hasDatabaseEditsRef.current = false;

                      setSubscriptionData({
                        type: originalValues.type,
                        price: originalValues.price,
                        startDate: originalValues.start,
                        endDate: originalValues.end,
                        currency: originalValues.currency,
                      });

                      setAcknowledged(false);

                      setTimeout(() => {
                        justSwitchedSourceRef.current = false;
                      }, 100);
                    } : handleRefetch}
                    disabled={source !== 'database' && fetchState?.isFetching}
                    className={`border text-xs font-medium rounded-md px-1.5 py-0 transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-current ${source === 'database'
                      ? 'border-red-600 text-red-600 hover:text-white hover:bg-red-600'
                      : source === 'wordpress'
                        ? 'border-orange-600 text-orange-600 hover:text-white hover:bg-orange-600'
                        : 'border-purple-600 text-purple-600 hover:text-white hover:bg-purple-600'
                      }`}
                  >
                    ⟳
                  </button>

                  <span className="text-xs text-gray-500">
                    {source === 'database' && hasChanges && "Reset to original"}
                    {source !== 'database' && fetchState.isFetching && "Checking for updates…"}
                    {source !== 'database' && !fetchState.isFetching && fetchState.lastRefreshed && `Updated at ${formatDateTime(fetchState.lastRefreshed)}`}
                  </span>
                </div>
              )}
            </div>
            <div className={`mt-5 border-2 rounded-md p-4 space-y-4 bg-gray-50 ${source === 'database'
              ? 'border-red-500'
              : source === 'wordpress'
                ? 'border-orange-500'
                : 'border-purple-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <select
                  value={fetchState.isFetching ? "free" : subscriptionData.type}
                  onChange={(e) =>
                    setSubscriptionData(prev => ({ ...prev, type: e.target.value as 'free' | 'monthly' | 'yearly' }))
                  }
                  disabled={isReadOnly}
                  className={`border rounded-md p-2 w-1/2 focus:outline-none focus:ring-2 ${source === 'database'
                    ? 'focus:ring-red-500'
                    : source === 'wordpress'
                      ? 'focus:ring-orange-500'
                      : 'focus:ring-purple-500'
                    }${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="free">Free</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <input
                  type="number"
                  value={fetchState.isFetching ? 0 : subscriptionData.price}
                  onChange={(e) => {
                    hasDatabaseEditsRef.current = true;
                    setSubscriptionData(prev => ({ ...prev, price: Number(e.target.value) }))
                  }}
                  disabled={isReadOnly}
                  className={`border rounded-md p-2 w-1/3 focus:outline-none focus:ring-2 ${source === 'database'
                    ? 'focus:ring-red-500'
                    : source === 'wordpress'
                      ? 'focus:ring-orange-500'
                      : 'focus:ring-purple-500'
                    } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                <span className="text-gray-600 font-semibold">
                  {subscriptionData.currency || originalValues.currency || "USD"}
                </span>
              </div>

              {fetchState.isFetching ? (
                <div className={`text-center py-4 rounded-md ${source === 'database'
                  ? 'bg-red-50 text-red-600'
                  : source === 'wordpress'
                    ? 'bg-orange-50 text-orange-600'
                    : 'bg-purple-50 text-purple-600'
                  }`}>
                  <p className="font-medium">Checking for updates ...</p>
                  <p className="text-sm opacity-75">
                    Checking subscription data from {source === 'wordpress' ? 'WordPress' : 'RevenueCat'}
                  </p>
                </div>
              ) : fetchState.userNotFound ? (
                <div className={`text-center py-4 rounded-md ${source === 'database'
                  ? 'bg-red-50 text-red-600'
                  : source === 'wordpress'
                    ? 'bg-orange-50 text-orange-600'
                    : 'bg-purple-50 text-purple-600'
                  }`}>
                  <p className="font-medium">User Not Found</p>
                  <p className="text-sm opacity-75">
                    No user found in {source === 'wordpress' ? 'WordPress' : 'RevenueCat'} with this ID.
                  </p>
                </div>
              ) : subscriptionData.type === 'free' && source !== 'database' ? (
                <div className={`text-center py-4 rounded-md ${source === 'wordpress'
                  ? 'bg-orange-50 text-orange-600'
                  : 'bg-purple-50 text-purple-600'
                  }`}>
                  <p className="font-medium">No Active Subscription Found</p>
                  <p className="text-sm opacity-75">
                    This user has no active or pending subscription in {source === 'wordpress' ? 'WordPress' : 'RevenueCat'}.
                  </p>
                </div>
              ) : subscriptionData.type === 'free' ? (
                <div className="text-center py-4 rounded-md bg-red-50 text-red-600">
                  <p className="font-medium">Free Plan Selected</p>
                </div>
              ) : !subscriptionData.startDate && !subscriptionData.endDate ? (
                <div className="text-center py-4 rounded-md bg-red-50 text-red-600">
                  <p className="font-medium">No Subscription Data</p>
                  <p className="text-sm opacity-75">Please enter the subscription dates below.</p>
                  <div className="mt-4 text-left space-y-2">
                    <div className="flex items-center">
                      <span className="w-40 font-semibold text-gray-700">New Purchase Date:</span>
                      <input
                        type="datetime-local"
                        value={subscriptionData.startDate}
                        onChange={(e) => {
                          hasDatabaseEditsRef.current = true;
                          setSubscriptionData(prev => ({ ...prev, startDate: e.target.value }))
                        }}

                        className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="w-40 font-semibold text-gray-700">New End Date:</span>
                      <input
                        type="datetime-local"
                        value={subscriptionData.endDate}
                        onChange={(e) => {
                          hasDatabaseEditsRef.current = true;
                          setSubscriptionData(prev => ({ ...prev, endDate: e.target.value }))
                        }}
                        className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center">
                    <span className="w-40 font-semibold">New Purchase Date:</span>
                    <input
                      type="datetime-local"
                      value={subscriptionData.startDate}
                      onChange={(e) => setSubscriptionData(prev => ({ ...prev, startDate: e.target.value }))}
                      disabled={isReadOnly}
                      className={`border rounded-md p-2 focus:outline-none focus:ring-2 ${source === 'database'
                        ? 'focus:ring-red-500'
                        : source === 'wordpress'
                          ? 'focus:ring-orange-500'
                          : 'focus:ring-purple-500'
                        } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div className="flex items-center">
                    <span className="w-40 font-semibold">New End Date:</span>
                    <input
                      type="datetime-local"
                      value={subscriptionData.endDate}
                      onChange={(e) => setSubscriptionData(prev => ({ ...prev, endDate: e.target.value }))}
                      disabled={isReadOnly}
                      className={`border rounded-md p-2 focus:outline-none focus:ring-2 ${source === 'database'
                        ? 'focus:ring-red-500'
                        : source === 'wordpress'
                          ? 'focus:ring-orange-500'
                          : 'focus:ring-purple-500'
                        } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>
              )}
              {validationErrors.length > 0 && hasChanges && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm font-semibold text-red-700 mb-1">Validation Errors:</p>
                  <ul className="text-xs text-red-600 list-disc list-inside space-y-1">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(hasChanges && !fetchState.userNotFound && !fetchState.isExpired && !fetchState.isFetching) && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <input
                      id="acknowledge"
                      type="checkbox"
                      checked={acknowledged}
                      onChange={(e) => setAcknowledged(e.target.checked)}
                      className={`rounded ${source === 'database'
                        ? 'text-red-600 focus:ring-red-500'
                        : source === 'wordpress'
                          ? 'text-orange-500 focus:ring-orange-500'
                          : 'text-purple-600 focus:ring-purple-500'
                        }`}
                    />
                    <label htmlFor="acknowledge" className="text-sm text-gray-700">
                      I acknowledge that I am{' '}
                      <strong>
                        {isUpgrade ? 'upgrading' : isDowngrade ? 'downgrading' : 'changing'}
                      </strong>{' '}
                      this user's subscription.
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-4">
                <Button
                  type="button"
                  onClick={handleCancel}
                  ref={cancelButtonRef}
                  variant="inverse"
                  className={`border ${source === 'database'
                    ? 'border-red-600 text-red-600 hover:bg-red-50'
                    : source === 'wordpress'
                      ? 'border-orange-500 text-orange-500 hover:bg-orange-50'
                      : 'border-purple-600 text-purple-600 hover:bg-purple-50'
                    }`}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!acknowledged || isLoading || !hasChanges}
                  className={`text-white disabled:opacity-50 ${source === 'database'
                    ? 'bg-red-600 hover:bg-red-700'
                    : source === 'wordpress'
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                >
                  {isLoading ? 'Processing...' : 'Confirm'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
