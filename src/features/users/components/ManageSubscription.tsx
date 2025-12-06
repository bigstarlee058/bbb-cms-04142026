import { InformationCircleIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { Button } from '@/components/Elements/Button';
import { Dialog, DialogTitle } from '@/components/Elements/Dialog';
import { useDisclosure } from '@/hooks/useDisclosure';
import { updateUserSubscription } from '../api';
import { useMutation } from 'react-query';
import { useNotificationStore } from '@/stores/notifications';
import { formatDate } from '@/utils/format';

interface SubscriptionProps {
  id: string;
  name?: string;
  email?: string;
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
  email,
  onClose,
  currentSubscription,
}) => {
  const { isOpen, close } = useDisclosure(true);
  const cancelButtonRef = React.useRef(null);
  const { addNotification } = useNotificationStore();

  const [subscriptionType, setSubscriptionType] = React.useState<
    'free' | 'monthly' | 'yearly' | 'custom'
  >(currentSubscription?.subscription_type || 'free');

  const [price, setPrice] = React.useState<number>(() => {
  const raw = currentSubscription?.price;
  if (!raw) return 0;
  const [value] = raw.split(" ");
  return parseFloat(value);
});

const currency = currentSubscription?.price?.split(" ")[1] ?? "";


  const [acknowledged, setAcknowledged] = React.useState(false);
  const toLocalDateTime = (date: Date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [customStart, setCustomStart] = React.useState(
    toLocalDateTime(new Date())
  );
  const [customEnd, setCustomEnd] = React.useState(
    toLocalDateTime(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  );

  const DEFAULT_PRICES = {
    monthly: 29.95,
    yearly: 289.95,
  };
  React.useEffect(() => {
  if (price === 0 && subscriptionType !== 'custom') {
    setPrice(DEFAULT_PRICES[subscriptionType] || 0);
  }
  
    setAcknowledged(false);

  }, [subscriptionType]);

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

  const handleConfirm = () => {
    if (!acknowledged) return;

    let subscription =
      subscriptionType === 'free'
        ? {
          subscription_type: 'free',
          price: '0',
          user_subscription_status: 'free_user',
          purchase_date: null,
          end_date: null,
        }
        : {
          subscription_type: subscriptionType,
          price: price.toString(),
          user_subscription_status: 'subscribed_user',
          purchase_date: new Date().toISOString(),
          end_date:
            subscriptionType === 'monthly'
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        };
    if (subscriptionType === 'custom') {
       subscription = {
        subscription_type: 'monthly',
        price: price.toString(),
        user_subscription_status: 'subscribed_user',
        purchase_date: customStart,
        end_date: customEnd,
      };
    }


    mutate({ userId: id, subscription });
  };
  const handleCancel = () => {
    close();
    onClose?.();
  };

  const currentType = currentSubscription?.subscription_type || 'free';
  const isUpgrade =
    (currentType === 'free' && subscriptionType !== 'free') ||
    (currentType === 'monthly' && subscriptionType === 'yearly');
  const isDowngrade =
    (currentType === 'yearly' && subscriptionType !== 'yearly') ||
    (currentType !== 'free' && subscriptionType === 'free');

  return (
    <Dialog isOpen={isOpen} onClose={handleCancel} initialFocus={cancelButtonRef}>
      <div
        className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left 
        overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
      >
        <div className="sm:flex sm:items-start">
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <DialogTitle as="h3" className="text-md leading-6 font-medium text-gray-900 flex items-center space-x-2">
              <InformationCircleIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              <span>Manage Subscription</span>
            </DialogTitle>
            <div className="mt-3 text-sm text-gray-600 space-y-2">
              {name && (
                <p>
                  <strong>Name:</strong> {name}
                </p>
              )}
              {email && (
                <p>
                  <strong>Email:</strong> {email}
                </p>
              )}
              <p>
                <strong>Current Plan:</strong>{' '}
                {currentType === 'free'
                  ? 'Free'
                  : currentType === 'monthly'
                    ? 'Monthly'
                    : 'Yearly'}
              </p>

              {currentSubscription?.purchase_date && (
                <p>
                  <strong>Purchase Date:</strong>{' '}
                  {formatDate(currentSubscription.purchase_date)}
                </p>
              )}

              {currentSubscription?.end_date && (
                <p>
                  <strong>End Date:</strong> {formatDate(currentSubscription.end_date)}
                </p>
              )}
            </div>

            <div className="mt-5 border rounded-md p-4 space-y-4 bg-gray-50">
              <div className="flex items-center space-x-3">
                <select
                  value={subscriptionType}
                  onChange={(e) =>
                    setSubscriptionType(e.target.value as 'free' | 'monthly' | 'yearly')
                  }
                  className="border rounded-md p-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="free">Free</option>
                  <option value="custom">Custom</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>

                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  disabled={subscriptionType === 'free'}
                  className="border rounded-md p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-600 font-semibold">{currency||"$"}</span>
              </div>

              {subscriptionType !== currentSubscription.subscription_type && (
                <div className="space-y-2">
                  {["monthly", "yearly"].includes(subscriptionType) && (
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex">
                        <span className="w-40 font-semibold">New Purchase Date:</span>
                        <span>{formatDate(new Date())}</span>
                      </div>
                      <div className="flex">
                        <span className="w-40 font-semibold">New End Date:</span>
                        <span>
                          {subscriptionType === 'monthly'
                            ? formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
                            : subscriptionType === 'yearly'
                              ? formatDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
                              : ''}
                        </span>
                      </div>
                    </div>
                  )}
                  {subscriptionType === 'custom' && (
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <span className="w-40 font-semibold">New Purchase Date:</span>
                        <input
                          type="datetime-local"
                          value={customStart}
                          onChange={(e) =>
                            setCustomStart(e.target.value)
                          }
                          className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center">
                        <span className="w-40 font-semibold">New End Date:</span>
                        <input
                          type="datetime-local"
                          value={customEnd}
                          onChange={(e) =>
                            setCustomEnd(e.target.value)
                          }
                          className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <input
                      id="acknowledge"
                      type="checkbox"
                      checked={acknowledged}
                      onChange={(e) => setAcknowledged(e.target.checked)}
                    />
                    <label htmlFor="acknowledge" className="text-sm text-gray-700">
                      I acknowledge that I am{' '}
                      <strong>
                        {isUpgrade ? 'upgrading' : isDowngrade ? 'downgrading' : 'changing'}
                      </strong>{' '}
                      this user’s subscription.
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
                  className="border border-red-600 text-red-600 hover:bg-red-50"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={
                    !acknowledged ||
                    isLoading ||
                    subscriptionType === currentSubscription.subscription_type
                  }
                  className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
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
