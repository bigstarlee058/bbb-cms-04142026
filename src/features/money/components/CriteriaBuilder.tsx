import React, { useEffect } from 'react';
import { TargetCriteria } from '../types';
import { Select } from '@/components/Form';

interface CriteriaBuilderProps {
    criteria: TargetCriteria;
    onChange: (criteria: TargetCriteria) => void;
}

const SUBSCRIPTION_STATUS = [
    { value: 'all', label: 'All' },
    { value: 'subscribed_user', label: 'Subscribed' },
    { value: 'free', label: 'Free' },
];

const SUBSCRIPTION_TYPES = [
    { value: 'trial', label: 'Trial' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
];

const SUBSCRIPTION_SOURCES = [
    { value: 'wp', label: 'WordPress' },
    { value: 'rc', label: 'RevenueCat' },
    { value: 'admin', label: 'Admin' },
];

const SIGNUP_SOURCES = [
    { value: 'all', label: 'All' },
    { value: 'wordpress', label: 'WordPress' },
    { value: 'mobile', label: 'Mobile' },
];

export const CriteriaBuilder: React.FC<CriteriaBuilderProps> = ({ criteria, onChange }) => {

    const shouldShowSubscriptionType = (): boolean => {
        return criteria.subscriptionStatus === 'subscribed_user';
    };

    useEffect(() => {
        if (!shouldShowSubscriptionType() && criteria.subscriptionType.length > 0) {
            onChange({ ...criteria, subscriptionType: [] });
        }
    }, [criteria.subscriptionStatus]);

    const createMockFormik = (field: keyof TargetCriteria) => ({
        values: { [field]: criteria[field] },
        errors: {},
        touched: {},
        setFieldValue: () => { },
    });

    const handleSelectChange = (field: keyof TargetCriteria, selectedOptions: any) => {
        const values = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
        onChange({ ...criteria, [field]: values });
    };

    const getSelectedValues = (field: keyof TargetCriteria, options: { value: string; label: string }[]) => {
        const currentValues = criteria[field] as string[];
        return currentValues.map((value) => {
            const option = options.find((opt) => opt.value === value);
            return { label: option?.label || value, value };
        });
    };

    return (
        <div className="mt-3 space-y-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 w-14">Signup:</span>
                <div className="flex gap-1 flex-1">
                    {SIGNUP_SOURCES.map(({ value, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => onChange({ ...criteria, signupSource: value })}
                            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors ${criteria.signupSource === value
                                ? 'bg-[#9a354e] text-white border-[#9a354e]'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-[#9a354e]'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 w-14">Status:</span>
                <div className="flex gap-1 flex-1">
                    {SUBSCRIPTION_STATUS.map(({ value, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => onChange({ ...criteria, subscriptionStatus: value })}
                            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors ${criteria.subscriptionStatus === value
                                ? 'bg-[#9a354e] text-white border-[#9a354e]'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-[#9a354e]'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {shouldShowSubscriptionType() && (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600 w-28 shrink-0">Subscription Type:</span>
                    <div className="flex-1">
                        <Select
                            isMulti
                            formik={createMockFormik('subscriptionType')}
                            label=""
                            name="subscriptionType"
                            placeholder="Select types..."
                            options={SUBSCRIPTION_TYPES}
                            value={getSelectedValues('subscriptionType', SUBSCRIPTION_TYPES)}
                            onChange={(value: any) => handleSelectChange('subscriptionType', value)}
                        />
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 w-28 shrink-0">Source:</span>
                <div className="flex-1">
                    <Select
                        isMulti
                        formik={createMockFormik('subscriptionSource')}
                        label=""
                        name="subscriptionSource"
                        placeholder="Select sources..."
                        options={SUBSCRIPTION_SOURCES}
                        value={getSelectedValues('subscriptionSource', SUBSCRIPTION_SOURCES)}
                        onChange={(value: any) => handleSelectChange('subscriptionSource', value)}
                    />
                </div>
            </div>

            {(criteria.subscriptionType.length > 0 ||
                criteria.subscriptionSource.length > 0 ||
                criteria.signupSource !== 'all' ||
                criteria.subscriptionStatus !== 'all') && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-200">
                        {criteria.subscriptionStatus && criteria.subscriptionStatus !== 'all' && (
                            <span className="text-xs bg-[#9a354e]/10 text-[#9a354e] px-2 py-0.5 rounded">
                                {SUBSCRIPTION_STATUS.find(s => s.value === criteria.subscriptionStatus)?.label}
                            </span>
                        )}
                        {criteria.subscriptionType.map(type => (
                            <span key={type} className="text-xs bg-[#9a354e]/10 text-[#9a354e] px-2 py-0.5 rounded">
                                {SUBSCRIPTION_TYPES.find(t => t.value === type)?.label}
                            </span>
                        ))}
                        {criteria.subscriptionSource.map(source => (
                            <span key={source} className="text-xs bg-[#9a354e]/10 text-[#9a354e] px-2 py-0.5 rounded">
                                {SUBSCRIPTION_SOURCES.find(s => s.value === source)?.label}
                            </span>
                        ))}
                        {criteria.signupSource && criteria.signupSource !== 'all' && (
                            <span className="text-xs bg-[#9a354e]/10 text-[#9a354e] px-2 py-0.5 rounded">
                                {SIGNUP_SOURCES.find(s => s.value === criteria.signupSource)?.label}
                            </span>
                        )}
                    </div>
                )}
        </div>
    );
};