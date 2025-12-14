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


interface ReadOnlySubscriptionDisplayProps {
  type: string;
  price: number;
  currency: string;
  startDate: string;
  endDate: string;
  duration: string;
  source: 'wordpress' | 'revenuecat';
  lastUpdated?: Date | null;
}

export const ReadOnlySubscriptionDisplay: React.FC<ReadOnlySubscriptionDisplayProps> = ({
  type,
  price,
  currency,
  startDate,
  endDate,
  duration,
  source,
  lastUpdated,
}) => {
  const borderClass = source === 'wordpress' ? 'border-orange-200' : 'border-purple-200';
  const bgClass = source === 'wordpress' ? 'bg-orange-50' : 'bg-purple-50';
  const badgeBg = source === 'wordpress' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700';
  const labelClass = source === 'wordpress' ? 'text-orange-500' : 'text-purple-500';

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-1">
      {lastUpdated && (
        <div className="flex justify-end">
          <span className={`text-xs ${labelClass}`}>
            Updated at {formatLastUpdated(lastUpdated)}
          </span>
        </div>
      )}

      <div className={`border ${borderClass} rounded-lg overflow-hidden text-sm`}>
        <div className={`flex items-center justify-between p-3 ${bgClass}`}>
          <span className={`text-xs font-medium uppercase tracking-wide ${labelClass}`}>
            {source === 'wordpress' ? 'WordPress' : 'RevenueCat'} Subscription
          </span>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${badgeBg}`}>
            {type === 'free' ? 'Free' : type === 'monthly' ? 'Monthly' : 'Yearly'}
          </span>
        </div>

        <div className={`flex border-t ${borderClass}`}>
          <div className={`flex-1 p-2 border-r ${borderClass}`}>
            <p className={`text-xs ${labelClass}`}>Price</p>
            <p className="font-medium text-gray-800">{price} {currency}</p>
          </div>
          <div className="flex-1 p-2">
            <p className={`text-xs ${labelClass}`}>Period</p>
            <p className="font-medium text-gray-800">{duration || '—'}</p>
          </div>
        </div>

        <div className={`border-t ${borderClass} p-2 space-y-1`}>
          <div className="flex">
            <span className={`${labelClass} w-20 text-xs`}>Purchased:</span>
            <span className="text-gray-800 text-xs">{formatDisplayDate(startDate)}</span>
          </div>
          <div className="flex">
            <span className={`${labelClass} w-20 text-xs`}>Ends:</span>
            <span className="text-gray-800 text-xs">{formatDisplayDate(endDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
interface EditableSubscriptionFormProps {
  type: 'free' | 'monthly' | 'yearly';
  price: number;
  currency: string;
  startDate: string;
  endDate: string;
  duration: string;
  onTypeChange: (type: 'free' | 'monthly' | 'yearly') => void;
  onPriceChange: (price: number) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export const EditableSubscriptionForm: React.FC<EditableSubscriptionFormProps> = ({
  type,
  price,
  currency,
  startDate,
  endDate,
  duration,
  onTypeChange,
  onPriceChange,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as 'free' | 'monthly' | 'yearly')}
          className="border rounded-md p-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="free">Free</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <input
          type="text"
          value={price}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          disabled={type === 'free'}
          className="border rounded-md p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
        />
        <span className="text-gray-600 font-semibold">{currency}</span>
      </div>

      {type === 'free' ? (
        <div className="text-center py-4 rounded-md bg-red-50 text-red-600 min-h-[100px] flex items-center justify-center">
          <p className="font-medium">Free Plan Selected</p>
        </div>
      ) : (
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex items-center">
            <span className="w-40 font-semibold">New Purchase Date:</span>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center">
            <span className="w-40 font-semibold">New End Date:</span>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {duration && (
            <div className="flex items-center">
              <span className="w-40 font-semibold">Period:</span>
              <span className="font-medium text-red-600">{duration}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface SubscriptionStatusOverlayProps {
  status: 'loading' | 'not_found' | 'no_subscription' | 'expired';
  source: 'wordpress' | 'revenuecat';
  lastUpdated?: Date | null;
}

export const SubscriptionStatusOverlay: React.FC<SubscriptionStatusOverlayProps> = ({
  status,
  source,
  lastUpdated,
}) => {
  const sourceName = source === 'wordpress' ? 'WordPress' : 'RevenueCat';
  const bgClass = source === 'wordpress' ? 'bg-orange-50' : 'bg-purple-50';
  const textClass = source === 'wordpress' ? 'text-orange-600' : 'text-purple-600';
  const borderClass = source === 'wordpress' ? 'border-orange-200' : 'border-purple-200';

  const content = {
    loading: {
      title: 'Checking for updates...',
      subtitle: `Fetching subscription data from ${sourceName}`,
    },
    not_found: {
      title: 'User Not Found',
      subtitle: `No user found in ${sourceName} with this ID`,
    },
    no_subscription: {
      title: 'No Active Subscription',
      subtitle: `This user has no active subscription in ${sourceName}`,
    },
    expired: {
      title: 'Subscription Expired',
      subtitle: `The subscription in ${sourceName} has expired`,
    },
  };

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const { title, subtitle } = content[status];

  return (
    <div className="space-y-1">
      {lastUpdated && status !== 'loading' ? (
        <div className="flex justify-end">
          <span className={`text-xs ${textClass} opacity-75`}>
            Updated at {formatLastUpdated(lastUpdated)}
          </span>
        </div>
      ) : (
        <div className="flex justify-end">
          <span className={`text-xs ${textClass} opacity-75`}>
            Loading the data ...
          </span>
        </div>
      )}

      <div className={`text-center py-6 rounded-lg ${bgClass} border ${borderClass} min-h-[140px] flex flex-col items-center justify-center`}>
        <p className={`font-semibold ${textClass}`}>{title}</p>
        <p className={`text-xs mt-1 ${textClass} opacity-75`}>{subtitle}</p>
      </div>
    </div>
  );
};
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
  const calculateDuration = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return '';

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) return 'Expired';

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const parts: string[] = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (days > 0 && years === 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (parts.length === 0 && days === 0 && months === 0 && years === 0) {
      const hours = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60));
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
      return '< 1 hour';
    }

    return parts.join(', ') || '< 1 day';
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

  const checkRevenueCatUserExists = async (userId: string): Promise<boolean> => {
    try {
     await axios.get(
        `https://api.revenuecat.com/v2/projects/${process.env.REACT_APP_REVENUECAT_PROJECT_ID}/customers/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_REVENUECAT_API_KEY_V2}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return true;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return false;
      }
      throw error;
    }
  };

  const fetchRevenueCatSubscription = async (userId: string) => {
    try {
      const response = await axios.get(
        `https://api.revenuecat.com/v1/subscribers/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_REVENUECAT_API_KEY_V1}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch subscriptions from RevenueCat:', error);
      throw new Error(
        error?.response?.data?.message ||
        'Unable to fetch subscriptions from RevenueCat'
      );
    }
  };
  const fetchFromRevenueCat = async (userId: string) => {
    const userExists = await checkRevenueCatUserExists(userId);

    if (!userExists) {
      return { userExists: false, data: null };
    }

    const data = await fetchRevenueCatSubscription(userId);
    return { userExists: true, data };
  };

  const processRevenueCatSubscription = (data: any) => {
    const today = new Date();
    const subscriber = data?.subscriber;
    if (!subscriber) {
      return freeResult();
    }

    const subscriptionsMap = subscriber.subscriptions || {};
    const subscriptions = Object.values(subscriptionsMap) as any[];

    if (!subscriptions.length) {
      return freeResult();
    }
    const subscription = subscriptions.sort(
      (a, b) =>
        new Date(b.expires_date).getTime() -
        new Date(a.expires_date).getTime()
    )[0];

    const purchase_date = subscription?.purchase_date
      ? toLocalDateTime(new Date(subscription.purchase_date))
      : toLocalDateTime(today);

    const end_date = subscription?.expires_date
      ? toLocalDateTime(new Date(subscription.expires_date))
      : toLocalDateTime(today);

    const price = Number(subscription?.price?.amount ?? 0);
    const currency = subscription?.price?.currency ?? 'USD';

    let subscription_type: 'free' | 'monthly' | 'yearly' = 'free';

    const productId = subscription?.product_identifier || '';
    const productIdLower = productId.toLowerCase();

    if (
      subscription?.period_type === 'annual' ||
      productIdLower.includes('year') ||
      productIdLower.includes('annual')
    ) {
      subscription_type = 'yearly';
    } else if (
      subscription?.period_type === 'normal' ||
      subscription?.period_type === 'trial' ||
      productIdLower.includes('month')
    ) {
      subscription_type = 'monthly';
    }

    const expiresAt = subscription?.expires_date
      ? new Date(subscription.expires_date).getTime()
      : 0;

    const isActive = expiresAt > Date.now();

    return {
      purchase_date,
      end_date,
      price,
      currency,
      subscription_type,
      isActive: isActive,
    };
  };

  const freeResult = () => ({
    purchase_date: '',
    end_date: '',
    price: 0,
    currency: 'USD',
    subscription_type: 'free' as const,
    status: 'inactive',

  });
  const processWordPressSubscription = (subscription: any) => {
    const today = new Date();

    const parseGMTDate = (dateStr: string) => {
      if (!dateStr) return null;
      const normalized = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
      return new Date(normalized);
    };

    const purchase_date = subscription?.last_payment_date_gmt
      ? toLocalDateTime(parseGMTDate(subscription.last_payment_date_gmt))
      : toLocalDateTime(today);

    let end_date: string;
    if (subscription?.end_date_gmt && subscription.end_date_gmt !== "") {
      end_date = toLocalDateTime(parseGMTDate(subscription.end_date_gmt));
    } else if (subscription?.next_payment_date_gmt && subscription.next_payment_date_gmt !== "") {
      end_date = toLocalDateTime(parseGMTDate(subscription.next_payment_date_gmt));
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

          if (!data.userExists) {
          setFetchState({
            isFetching: false,
            lastRefreshed: new Date(),
            userNotFound: true,
            isExpired: false,
          });
          resetToFreeSubscription();
          return;
        }

        const processed = processRevenueCatSubscription(data);


        if (
          processed.subscription_type === 'free' ||
          processed.isActive === false
        ) {
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
        className="inline-block align-bottom bg-white rounded-lg px-0 pt-2 pb-1 text-left 
        overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
      >
        <div className="sm:flex sm:items-start">
          <div className="mt-1 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <DialogTitle as="h3" className="text-md leading-6 font-medium text-gray-900 flex items-center space-x-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <strong className="text-md text-gray-800 mt-1">Manage Subscription</strong>
            </DialogTitle>

            <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden text-sm">
              <div className="flex items-start justify-between p-3 bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-900">{name}</p>
                  {email && <p className="text-gray-500 text-xs">{email}</p>}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${currentType === 'free'
                  ? 'bg-gray-200 text-gray-700'
                  : currentType === 'monthly'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                  }`}>
                  {currentType === 'free' ? 'Free' : currentType === 'monthly' ? 'Monthly' : 'Yearly'}
                </span>
              </div>

              {currentType !== 'free' && (
                <>
                  <div className="flex border-t border-gray-200">
                    <div className="flex-1 p-2 border-r border-gray-200">
                      <p className="text-gray-500 text-xs">Price</p>
                      <p className="font-medium text-gray-800">{originalValues.price} {originalValues.currency || "USD"}</p>
                    </div>
                    <div className="flex-1 p-2">
                      <p className="text-gray-500 text-xs">Period</p>
                      <p className="font-medium text-gray-800">{calculateDuration(originalValues.start, originalValues.end) || '—'}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 p-2 space-y-1">
                    {currentSubscription?.purchase_date && (
                      <div className="flex">
                        <span className="text-gray-500 w-20">Purchased:</span>
                        <span className="text-gray-800">{formatDate(currentSubscription.purchase_date)}</span>
                      </div>
                    )}
                    {currentSubscription?.end_date && (
                      <div className="flex">
                        <span className="text-gray-500 w-20">Ends:</span>
                        <span className="text-gray-800">{formatDate(currentSubscription.end_date)}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
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
                    className={`rounded-md border px-3 py-1.5 text-center text-sm font-medium transition-all transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-current ${source === 'database'
                      ? 'border-red-600 text-red-600 hover:text-white hover:bg-red-600'
                      : source === 'wordpress'
                        ? 'border-orange-600 text-orange-600 hover:text-white hover:bg-orange-600'
                        : 'border-purple-600 text-purple-600 hover:text-white hover:bg-purple-600'
                      }`}
                  >
                    {source === 'database' ? "Reset" : "Refresh"}
                  </button>
                </div>
              )}
            </div>
            <div className={`mt-2 border-2 rounded-md p-2 space-y-1 bg-gray-50 min-h-[250px] flex flex-col ${source === 'database' ? 'border-red-500'
              : source === 'wordpress'
                ? 'border-orange-500'
                : 'border-purple-600'
              }`}
            >

              <div className="flex-grow flex flex-col justify-center">

                {source === 'database' ? (
                  <>
                    <EditableSubscriptionForm
                      type={subscriptionData.type}
                      price={subscriptionData.price}
                      currency={subscriptionData.currency}
                      startDate={subscriptionData.startDate}
                      endDate={subscriptionData.endDate}
                      duration={calculateDuration(subscriptionData.startDate, subscriptionData.endDate)}
                      onTypeChange={(type) => setSubscriptionData(prev => ({ ...prev, type }))}
                      onPriceChange={(price) => {
                        hasDatabaseEditsRef.current = true;
                        setSubscriptionData(prev => ({ ...prev, price }));
                      }}
                      onStartDateChange={(startDate) => {
                        hasDatabaseEditsRef.current = true;
                        setSubscriptionData(prev => ({ ...prev, startDate }));
                      }}
                      onEndDateChange={(endDate) => {
                        hasDatabaseEditsRef.current = true;
                        setSubscriptionData(prev => ({ ...prev, endDate }));
                      }}
                    />
                  </>
                ) : fetchState.isFetching ? (
                  <SubscriptionStatusOverlay status="loading" source={source} />
                ) : fetchState.userNotFound ? (
                  <SubscriptionStatusOverlay status="not_found" source={source} lastUpdated={fetchState.lastRefreshed} />
                ) : fetchState.isExpired ? (
                  <SubscriptionStatusOverlay status="expired" source={source} lastUpdated={fetchState.lastRefreshed} />
                ) : subscriptionData.type === 'free' ? (
                  <SubscriptionStatusOverlay status="no_subscription" source={source} lastUpdated={fetchState.lastRefreshed} />
                ) : (
                  <ReadOnlySubscriptionDisplay
                    type={subscriptionData.type}
                    price={subscriptionData.price}
                    currency={subscriptionData.currency}
                    startDate={subscriptionData.startDate}
                    endDate={subscriptionData.endDate}
                    duration={calculateDuration(subscriptionData.startDate, subscriptionData.endDate)}
                    source={source}
                    lastUpdated={fetchState.lastRefreshed}
                  />
                )}
              </div>
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
              <div className="h-6">

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
              </div>

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
