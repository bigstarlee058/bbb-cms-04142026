import { EyeIcon } from '@heroicons/react/outline';
import { Button, Spinner } from '@/components/Elements';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { upsellApi } from '../api';
import { Upsell } from '../types';
import { formatDate } from '@/utils/format';

type UpsellDetailProps = {
  upsell: Upsell;
};

const TIMING_LABELS: Record<string, string> = {
  always: 'Always',
  date_range: 'Date Range',
  duration: 'Duration',
};

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  all: 'All',
  subscribed_user: 'Subscribed',
  free: 'Free',
};

const SUBSCRIPTION_TYPE_LABELS: Record<string, string> = {
  trial: 'Trial',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

const SUBSCRIPTION_SOURCE_LABELS: Record<string, string> = {
  wp: 'WordPress',
  rc: 'RevenueCat',
  admin: 'Admin',
};

const SIGNUP_SOURCE_LABELS: Record<string, string> = {
  all: 'All',
  wordpress: 'WordPress',
  mobile: 'Mobile',
};

const DISMISS_BEHAVIOR_LABELS: Record<string, { text: string; color: string }> = {
  session: { text: 'Session', color: 'bg-blue-100 text-blue-700' },
  days_30: { text: '30 Days', color: 'bg-yellow-100 text-yellow-700' },
  never: { text: 'Forever', color: 'bg-red-100 text-red-700' },
};

const calculateFinalPrice = (original: number, type: string, value: number): number => {
  const originalNum = Number(original) || 0;
  const valueNum = Number(value) || 0;
  if (type === 'percent') {
    return Math.max(0, originalNum - (originalNum * valueNum) / 100);
  }
  return Math.max(0, originalNum - valueNum);
};

export const UpsellDetail = ({ upsell }: UpsellDetailProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: usersCount, isLoading: isCountLoading } = useQuery(
    ['upsell-users-count', upsell._id],
    () =>
      upsellApi.countUsersByCriteria({
        targetType: upsell.targetType,
        criteria: upsell.targetCriteria,
      }),
    { enabled: isOpen }
  );

  const { data: dismissCount, isLoading: isDismissCountLoading } = useQuery(
    ['upsell-dismiss-count', upsell._id],
    () => upsellApi.getDismissCount(upsell._id),
    { enabled: isOpen }
  );

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const { targetCriteria, timeType, startDate, endDate, durationDays, durationHours } = upsell;
  const finalPrice = calculateFinalPrice(upsell.originalPrice, upsell.discountType, upsell.discountValue);
  const savings = Number(upsell.originalPrice || 0) - finalPrice;
  const dismissConfig = DISMISS_BEHAVIOR_LABELS[upsell.dismissBehavior] || DISMISS_BEHAVIOR_LABELS.session;

  return (
    <>
      <Button
        variant="danger"
        size="sm"
        startIcon={<EyeIcon className="h-4 w-4" />}
        onClick={handleOpen}
      />

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4">
            <div className="bg-[#9a354e] text-white px-4 py-2.5 rounded-t-lg flex items-center justify-between">
              <h3 className="font-semibold text-sm">Upsell Details</h3>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex gap-4 items-start">
                <img
                  src={upsell.image}
                  alt={upsell.title}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900">{upsell.title}</h4>
                  {upsell.subtitle && (
                    <p className="text-sm text-gray-500">{upsell.subtitle}</p>
                  )}
                  {upsell.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{upsell.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 rounded-lg border border-gray-200 px-4 py-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">Target:</span>
                  {isCountLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    <span className="text-sm font-semibold text-gray-900">
                      {usersCount?.count?.toLocaleString() || 0} users
                    </span>
                  )}
                </div>
                <div className="w-px h-4 bg-gray-300" />
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">Dismissed:</span>
                  {isDismissCountLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    <span className="text-sm font-semibold text-gray-900">
                      {dismissCount?.count?.toLocaleString() || 0}
                    </span>
                  )}
                </div>
                <div className="w-px h-4 bg-gray-300" />
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">Dismiss:</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${dismissConfig.color}`}>
                    {dismissConfig.text}
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300" />
                <div className="flex items-center gap-1">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      upsell.isActive
                        ? 'bg-[#9a354e]/10 text-[#9a354e]'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {upsell.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Pricing
                </h5>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 line-through">
                      {upsell.currency} {Number(upsell.originalPrice).toFixed(2)}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="text-[#9a354e]">
                      -{upsell.discountType === 'percent'
                        ? `${upsell.discountValue}%`
                        : `${upsell.currency} ${Number(upsell.discountValue).toFixed(2)}`}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="font-bold text-[#9a354e]">
                      {upsell.currency} {finalPrice.toFixed(2)}
                    </span>
                  </div>
                  {savings > 0 && (
                    <span className="text-xs text-[#9a354e] bg-[#9a354e]/10 px-2 py-0.5 rounded-full">
                      Save {upsell.currency} {savings.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Timing
                  </h5>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium text-gray-900">
                        {TIMING_LABELS[timeType] || timeType}
                      </span>
                    </div>
                    {timeType === 'date_range' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Start</span>
                          <span className="font-medium text-gray-900">{formatDate(startDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">End</span>
                          <span className="font-medium text-gray-900">{formatDate(endDate)}</span>
                        </div>
                      </>
                    )}
                    {timeType === 'duration' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Days</span>
                          <span className="font-medium text-gray-900">{durationDays || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Hours</span>
                          <span className="font-medium text-gray-900">{durationHours || 0}</span>
                        </div>
                      </>
                    )}
                    {timeType === 'always' && (
                      <p className="text-gray-400 italic text-xs">No time restrictions</p>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Targeting
                  </h5>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium text-gray-900">
                        {upsell.targetType === 'all' ? 'All Users' : 'By Criteria'}
                      </span>
                    </div>
                    {upsell.targetType === 'all' && (
                      <p className="text-gray-400 italic text-xs">No targeting restrictions</p>
                    )}
                    {upsell.targetType === 'criteria' && targetCriteria && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Signup</span>
                          <span className="font-medium text-gray-900">
                            {SIGNUP_SOURCE_LABELS[targetCriteria.signupSource] || targetCriteria.signupSource}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status</span>
                          <span className="font-medium text-gray-900">
                            {SUBSCRIPTION_STATUS_LABELS[targetCriteria.subscriptionStatus] || targetCriteria.subscriptionStatus}
                          </span>
                        </div>
                        {targetCriteria.subscriptionType?.length > 0 && (
                          <div className="flex justify-between items-start">
                            <span className="text-gray-500">Types</span>
                            <div className="flex flex-wrap gap-1 justify-end">
                              {targetCriteria.subscriptionType.map((type: string) => (
                                <span
                                  key={type}
                                  className="px-1.5 py-0.5 text-xs font-medium bg-[#9a354e]/10 text-[#9a354e] rounded"
                                >
                                  {SUBSCRIPTION_TYPE_LABELS[type] || type}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {targetCriteria.subscriptionSource?.length > 0 && (
                          <div className="flex justify-between items-start">
                            <span className="text-gray-500">Sources</span>
                            <div className="flex flex-wrap gap-1 justify-end">
                              {targetCriteria.subscriptionSource.map((source: string) => (
                                <span
                                  key={source}
                                  className="px-1.5 py-0.5 text-xs font-medium bg-[#9a354e]/10 text-[#9a354e] rounded"
                                >
                                  {SUBSCRIPTION_SOURCE_LABELS[source] || source}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Button
                </h5>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Text:</span>
                    <span className="font-medium text-gray-900">{upsell.buttonText}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Link:</span>
                    <a
                      href={upsell.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#9a354e] hover:underline max-w-[200px] truncate"
                    >
                      {upsell.buttonLink}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Created: {formatDate(upsell.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};