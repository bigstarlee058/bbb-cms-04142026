import { InformationCircleIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { Button } from '@/components/Elements/Button';
import { Dialog, DialogTitle } from '@/components/Elements/Dialog';
import { useDisclosure } from '@/hooks/useDisclosure';
import { updateUserSubscription, fetchUserSubscription } from '../api';
import { useMutation } from 'react-query';
import { useNotificationStore } from '@/stores/notifications';
import { formatDate } from '@/utils/format';
const SUBSCRIPTION_TYPES = [
  { id: 'free', label: 'Free', value: 'free' },
  { id: 'trial', label: 'Trial', value: 'trial' },
  { id: 'weekly', label: 'Weekly', value: 'weekly' },
  { id: 'monthly', label: 'Monthly', value: 'monthly' },
  { id: 'quarterly', label: 'Quarterly', value: 'quarterly' },
  { id: 'yearly', label: 'Yearly', value: 'yearly' },
];
const formatLastUpdated = (date: Date) => {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();

  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  const hh = String(hours).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${mm}/${dd}/${yyyy} ${hh}:${min}:${ss} ${ampm}`;
};

const toIsoUtc = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return '';
  return date.toISOString();
};

const isoToLocalInput = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const localInputToIso = (localString: string): string => {
  if (!localString) return '';
  const date = new Date(localString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString();
};
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
            {type.charAt(0).toUpperCase() + type.slice(1)}
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
  type: string;
  price: number;
  currency: string;
  startDate: string;
  endDate: string;
  duration: string;
  onTypeChange: (type: string) => void;
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
          onChange={(e) => onTypeChange(e.target.value)}
          className="border rounded-md p-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {SUBSCRIPTION_TYPES.map((subType) => (
            <option key={subType.id} value={subType.value}>
              {subType.label}
            </option>
          ))}
        </select>
        <input
          type="number"
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
              value={isoToLocalInput(startDate)}
              onChange={(e) => onStartDateChange(localInputToIso(e.target.value))}
              className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center">
            <span className="w-40 font-semibold">New End Date:</span>
            <input
              type="datetime-local"
              value={isoToLocalInput(endDate)}
              onChange={(e) => onEndDateChange(localInputToIso(e.target.value))}
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
      title: 'No Active Subscription',
      subtitle: `There is no active subscription in ${sourceName}.`,
    },
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
    subscription_type?: string;
    price?: string;
    purchase_date?: string | number;
    end_date?: string | number;
    update_source?: 'admin' | 'wp' | 'rc' | null;
    update_date?: string | number | null;
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
      ? toIsoUtc(new Date(currentSubscription.purchase_date))
      : '',
    end: currentSubscription?.end_date
      ? toIsoUtc(new Date(currentSubscription.end_date))
      : '',
    currency: currentSubscription?.price?.replace(/[^a-zA-Z]/g, "") ?? "USD",
    updateSource: currentSubscription?.update_source || null,
    updateDate: currentSubscription?.update_date || null,
  }), [currentSubscription]);
  const [subscriptionData, setSubscriptionData] = React.useState({
    type: originalValues.type,
    price: originalValues.price,
    startDate: originalValues.start,
    endDate: originalValues.end,
    currency: originalValues.currency,
    updateSource: originalValues.updateSource,
  });

  const [fetchState, setFetchState] = React.useState({
    isFetching: false,
    lastRefreshed: null,
    userNotFound: false,
    isExpired: false,
  });


  const [acknowledged, setAcknowledged] = React.useState(false);
  const [source, setSource] = React.useState<'database' | 'wordpress' | 'revenuecat'>(
    originalValues.updateSource === 'wp' ? 'wordpress'
      : originalValues.updateSource === 'rc' ? 'revenuecat'
        : 'database'
  );
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
        updateSource: originalValues.updateSource
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
    const startDate = toIsoUtc(now);
    const type = subscriptionData.type;
    if (type === 'free' ) {
      setSubscriptionData(prev => ({
        ...prev,
        price: 0,
        startDate: '',
        endDate: '',
        currency: 'USD',
      }));
      return;
    }
    const endDate = new Date(now);
    let defaultPrice = 0;

    switch (type) {
      case 'weekly':
      case 'trial':
        endDate.setDate(endDate.getDate() + 7);
        defaultPrice = 9.99;
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        defaultPrice = 29.95;
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        defaultPrice = 79.95;
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        defaultPrice = 299.95;
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1);
        defaultPrice = 29.95;
    }

    setSubscriptionData(prev => ({
      ...prev,
      price: defaultPrice,
      startDate: startDate,
      endDate: toIsoUtc(endDate),
      currency: 'USD',
    }));
  }, [subscriptionData.type, source]);

  const processRevenueCatSubscription = (data: any) => {
    const subscriber = data?.subscriber;
    if (!subscriber) {
      return freeResult({
        purchase_date: originalValues.start,
        end_date: originalValues.end,
        price: originalValues.price,
        currency: originalValues.currency,
      });
    }

    const now = Date.now();
    const subscriptionsMap = subscriber.subscriptions || {};
    const subscriptions = Object.values(subscriptionsMap) as any[];

    if (!subscriptions.length) {
      return freeResult({
        purchase_date: originalValues.start,
        end_date: originalValues.end,
        price: originalValues.price,
        currency: originalValues.currency,
      });
    }

    const activeSubscription = subscriptions
      .filter((s) => {
        if (!s.expires_date) return false;
        if (s.refunded_at) return false;
        const expiresAt = new Date(s.expires_date).getTime();
        return expiresAt > now;
      })
      .sort(
        (a, b) =>
          new Date(b.expires_date).getTime() - new Date(a.expires_date).getTime()
      )[0];

    if (!activeSubscription) {
      return freeResult({
        purchase_date: originalValues.start,
        end_date: originalValues.end,
        price: originalValues.price,
        currency: originalValues.currency,
      });
    }

    let subscription_type = "free"
    const productId = (
      activeSubscription.product_identifier ||
      Object.keys(subscriptionsMap).find(
        (key) => subscriptionsMap[key] === activeSubscription
      ) ||
      ''
    ).toLowerCase();

    if (
      productId.includes('year') ||
      productId.includes('annual')
    ) {
      subscription_type = 'yearly';
    } else if (
      productId.includes('quarter') ||
      productId.includes('3month')
    ) {
      subscription_type = 'quarterly';
    } else if (
      productId.includes('month')
    ) {
      subscription_type = 'monthly';
    } else if (
      productId.includes('week')
    ) {
      subscription_type = 'weekly';
    } else if (
      productId.includes('trial')
    ) {
      subscription_type = 'trial';
    } else {
      subscription_type = 'monthly';
    }

    const purchase_date = activeSubscription.purchase_date
      ? toIsoUtc(new Date(activeSubscription.purchase_date))
      : '';

    const end_date = activeSubscription.expires_date
      ? toIsoUtc(new Date(activeSubscription.expires_date))
      : '';
    const price = Number(activeSubscription.price?.amount ?? 0);
    const currency = activeSubscription.price?.currency ?? 'USD';
    return {
      purchase_date,
      end_date,
      price,
      currency,
      subscription_type,
      isActive: true,
    };
  };

  const freeResult = (original?: {
    purchase_date?: string;
    end_date?: string;
    price?: number;
    currency?: string;
  }) => ({
    purchase_date: original?.purchase_date || '',
    end_date: original?.end_date || '',
    price: original?.price || 0,
    currency: original?.currency || 'USD',
    subscription_type: 'free' as const,
    isActive: false,
  });

  const processWordPressSubscription = (subscription: any) => {
    if (!subscription) {
      return {
        purchase_date: originalValues.start,
        end_date: originalValues.end,
        price: originalValues.price,
        currency: originalValues.currency,
        subscription_type: 'free' as const,
        isActive: false,
        isExpired: false,
      };
    }

    const parseGMTDate = (dateStr: string): Date | null => {
      if (!dateStr || dateStr === '') return null;
      return new Date(dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`);
    };

    const now = Date.now();

    const purchaseDate = parseGMTDate(subscription.start_date_gmt) ||
      parseGMTDate(subscription.last_payment_date_gmt) ||
      parseGMTDate(subscription.date_paid_gmt);

    const endDate = parseGMTDate(subscription.end_date_gmt) ||
      parseGMTDate(subscription.next_payment_date_gmt);

    const isActiveStatus = ['active', 'pending-cancel'].includes(subscription.status);
    const isExpired = endDate ? endDate.getTime() < now : false;
    const isActive = isActiveStatus && !isExpired;

    let price = 0;
    if (subscription.line_items?.length) {
      price = subscription.line_items.reduce((total: number, item: any) => {
        return total + parseFloat(item.subtotal || '0');
      }, 0);
    } else if (subscription.total) {
      price = parseFloat(subscription.total);
    }

    const currency = subscription.currency || 'USD';

    let subscription_type = "free"

    if (subscription.line_items?.length) {
      for (const item of subscription.line_items) {
        const variationId = item.variation_id?.toString();
        if (variationId === process.env.REACT_APP_SUBSCRIPTION_YEAR_ID) {
          subscription_type = 'yearly';
          break;
        } else if (variationId === process.env.REACT_APP_SUBSCRIPTION_MONTH_ID) {
          subscription_type = 'monthly';
          break;
        } else if (variationId === "54737") {
          subscription_type = 'quarterly';
          break;
        }
      }
    }

    if (subscription_type === 'free' && subscription.billing_period) {
      const period = subscription.billing_period.toLowerCase();
      if (period === 'year' || period === 'annual') {
        subscription_type = 'yearly';
      } else if (period === 'month') {
        subscription_type = 'monthly';
      }
    }

    if (subscription_type === 'free' && subscription.line_items?.length) {
      for (const item of subscription.line_items) {
        const name = (item.name || '').toLowerCase();
        if (name.includes('year') || name.includes('annual')) {
          subscription_type = 'yearly';
          break;
        } else if (name.includes('month')) {
          subscription_type = 'monthly';
          break;
        }
      }
    }

    return {
      purchase_date: purchaseDate ? toIsoUtc(purchaseDate) : '',
      end_date: endDate ? toIsoUtc(endDate) : '',
      price,
      currency,
      subscription_type,
      isActive,
      isExpired,
    };
  };
  const resetToFreeSubscription = () => {
    setSubscriptionData(prev => ({
      type: 'free',
      price: 0,
      startDate: '',
      endDate: '',
      currency: 'USD',
      updateSource: prev.updateSource,
    }));
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
        const response = await fetchUserSubscription({
          userId: uid,
          source: 'wp',
        });

        if (currentSourceRef.current !== fetchSource) return;

        const data = response.data || [];
        if (!data.length) {
          setFetchState({
            isFetching: false,
            lastRefreshed: new Date(),
            userNotFound: true,
            isExpired: false,
          });
          resetToFreeSubscription();
          return;
        }

        const active = data.find(
          (s: any) => s.status === 'active' || s.status === 'pending-cancel'
        );

        if (!active) {
          setFetchState({
            isFetching: false,
            lastRefreshed: new Date(),
            userNotFound: false,
            isExpired: true,
          });
          resetToFreeSubscription();
          return;
        }

        const processed = processWordPressSubscription(active);

        setSubscriptionData({
          type: processed.subscription_type,
          price: processed.price,
          startDate: processed.purchase_date,
          endDate: processed.end_date,
          currency: processed.currency,
          updateSource: 'wp',
        });

        setFetchState({
          isFetching: false,
          lastRefreshed: new Date(),
          userNotFound: false,
          isExpired: false,
        });
      }

      if (fetchSource === 'revenuecat') {
        const response = await fetchUserSubscription({
          userId: id,
          source: 'rc',
        });

        if (currentSourceRef.current !== fetchSource) return;
        const result = response.data;
        if (!result?.userExists) {
          setFetchState({
            isFetching: false,
            lastRefreshed: new Date(),
            userNotFound: true,
            isExpired: false,
          });
          resetToFreeSubscription();
          return;
        }

        const processed = processRevenueCatSubscription(result.data);

        if (!processed.isActive) {
          setFetchState({
            isFetching: false,
            lastRefreshed: new Date(),
            userNotFound: false,
            isExpired: true,
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
          updateSource: 'rc',
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
        message: error?.message || 'Failed to refresh subscription',
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
  const normalizeIso = (iso?: string) => {
    if (!iso) return '';
    return new Date(iso).setMilliseconds(0);
  };
  const changes = [
    {
      field: "subscriptionType",
      current: subscriptionData.type,
      original: originalValues.type,
      equal: subscriptionData.type === originalValues.type,
    },
    {
      field: "price",
      current: subscriptionData.price,
      original: originalValues.price,
      equal: subscriptionData.price === originalValues.price,
    },
    {
      field: "customStart",
      current: subscriptionData.startDate,
      original: originalValues.start,
      equal:
        normalizeIso(subscriptionData.startDate) ===
        normalizeIso(originalValues.start),
    },
    {
      field: "customEnd",
      current: subscriptionData.endDate,
      original: originalValues.end,
      equal:
        normalizeIso(subscriptionData.endDate) ===
        normalizeIso(originalValues.end),
    },
  ].filter(c => !c.equal);

  const hasChanges = changes.length > 0;

  const validationErrors = React.useMemo(() => {
    const errors: string[] = [];

    if (subscriptionData.type !== 'free') {
      if (subscriptionData.price < 0) {
        errors.push('Price cannot be negative');
      }
      if (subscriptionData.price === 0 && source === "database") {
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

    const getUpdateSource = (): 'admin' | 'wp' | 'rc' => {
      if (source === 'wordpress') return 'wp';
      if (source === 'revenuecat') return 'rc';
      return 'admin';
    };

    const isFreeType = subscriptionData.type === 'free';

    const subscription = isFreeType
      ? {
        subscription_type: subscriptionData.type,
        user_subscription_status: 'free_user',
        purchase_date: originalValues.start,
        end_date: originalValues.end,
        price: `${originalValues.price.toString()} ${originalValues.currency}`,
        update_source: getUpdateSource(),
      }
      : {
        subscription_type: subscriptionData.type,
        price: `${subscriptionData.price.toString()} ${subscriptionData.currency}`,
        user_subscription_status: 'subscribed_user',
        purchase_date: subscriptionData.startDate,
        end_date: subscriptionData.endDate,
        update_source: getUpdateSource(),
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

  const typeRank: Record<string, number> = {
    free: 0,
    trial: 1,
    weekly: 2,
    monthly: 3,
    quarterly: 4,
    yearly: 5,
  };

  const currentRank = typeRank[currentType] ?? 0;
  const newRank = typeRank[subscriptionData?.type] ?? 0;

  const isUpgrade = newRank > currentRank;
  const isDowngrade = newRank < currentRank;

  return (
    <Dialog isOpen={isOpen} onClose={handleCancel} initialFocus={cancelButtonRef}>
      <div
        className="inline-block align-bottom bg-white rounded-lg px-0 pt-2 pb-1 text-left 
        overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-3"
      >
        <div className="sm:flex sm:items-start">
          <div className="text-center sm:mt-0 sm:text-left w-full">
            <DialogTitle as="h3" className="text-md leading-6 font-medium text-gray-900 flex items-center space-x-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <strong className="text-md text-gray-800 mt-1">Manage Subscription</strong>
            </DialogTitle>

            <div className="mt-1.5 border border-gray-200 rounded-lg overflow-hidden text-sm">
              <div className="flex items-start justify-between p-3 bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-900">{name}</p>
                  {email && <p className="text-gray-500 text-xs">{email}</p>}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${currentType === 'free' ? 'bg-gray-200 text-gray-700'
                  : currentType === 'trial' ? 'bg-yellow-100 text-yellow-700'
                    : currentType === 'weekly' ? 'bg-cyan-100 text-cyan-700'
                      : currentType === 'monthly' ? 'bg-blue-100 text-blue-700'
                        : currentType === 'quarterly' ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-green-100 text-green-700'
                  }`}>
                  {currentType.charAt(0).toUpperCase() + currentType.slice(1)}
                </span>
              </div>

              {(originalValues.updateSource || originalValues.updateDate) && (
                <div className={`flex items-center justify-between px-3 py-1.5 text-xs ${originalValues.updateSource === 'admin' ? 'bg-red-50 border-t border-red-100'
                  : originalValues.updateSource === 'wp' ? 'bg-orange-50 border-t border-orange-100'
                    : 'bg-purple-50 border-t border-purple-100'
                  }`}>
                  <span className={`font-medium ${originalValues.updateSource === 'admin' ? 'text-red-600'
                    : originalValues.updateSource === 'wp' ? 'text-orange-800'
                      : 'text-purple-600'
                    }`}>
                    Updated via {originalValues.updateSource === 'admin' ? 'Admin'
                      : originalValues.updateSource === 'wp' ? 'WordPress'
                        : 'RevenueCat'}
                  </span>
                  {originalValues.updateDate && (
                    <span className="text-gray-800">
                      {formatDate(new Date(originalValues.updateDate))}
                    </span>
                  )}
                </div>
              )}

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
            </div>
            <div className="mt-1.5 flex items-center justify-between">
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
                        updateSource: originalValues.updateSource
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
            <div className={`mt-1.5 border-2 rounded-md p-1.5 space-y-1 bg-gray-50 min-h-[250px] flex flex-col ${source === 'database' ? 'border-red-500'
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
                      currency={subscriptionData.currency || "USD"}
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
                <div className="mt-1.5 p-1.5 bg-red-50 border border-red-200 rounded-md">
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
                  <div className="space-y-2 mt-1.5">
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

              <div className="flex justify-between mt-2">
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
