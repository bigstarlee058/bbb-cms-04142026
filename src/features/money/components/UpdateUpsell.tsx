import { PencilIcon } from '@heroicons/react/solid';
import { useFormik } from 'formik';
import { useMemo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import * as Yup from 'yup';
import { Button } from '@/components/Elements';
import { FormDrawer, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { upsellApi } from '../api';
import { CriteriaBuilder } from './CriteriaBuilder';
import { defaultTargetCriteria, TargetCriteria } from '../types';
import { useLanguageStore } from '@/stores/languages';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { TranslatableTextareaWithFormatting } from '@/components/Form/TranslatableTextareaWithFormatting';
import { TranslatableDropzone } from '@/components/Form/TranslatableDropzone';

interface FormikState {
    title: string;
    titleTranslations: Record<string, string>;
    subtitle: string;
    subtitleTranslations: Record<string, string>;
    description: string;
    descriptionTranslations: Record<string, string>;
    image: string;
    imageTranslations: Record<string, any>;
    dismissBehavior: 'session' | 'days_30' | 'never';
    deleteImage: boolean;
    deleteImageTranslations: Record<string, string>;
    originalPrice: number;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    currency: string;
    buttonText: string;
    buttonTextTranslations: Record<string, any>;
    buttonLink: string;
    buttonLinkTranslations: Record<string, any>;
    timeType: 'always' | 'date_range' | 'duration';
    startDate: string;
    endDate: string;
    durationDays: number;
    durationHours: number;
    targetType: 'all' | 'criteria';
    isActive: boolean;
    targetCriteria: TargetCriteria;
}

const updateUpsellSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    image: Yup.string().required('Image is required'),
    originalPrice: Yup.number().min(0, 'Must be positive').required('Required'),
    discountType: Yup.string().oneOf(['percent', 'fixed']).required('Required'),
    discountValue: Yup.number().min(0, 'Must be positive').required('Required'),
    buttonText: Yup.string().required('Required'),
    buttonLink: Yup.string().required('Required'),
});

const calculateFinalPrice = (original: number | string, type: 'percent' | 'fixed', value: number | string): number => {
    const originalNum = Number(original) || 0;
    const valueNum = Number(value) || 0;
    if (type === 'percent') {
        return Math.max(0, originalNum - (originalNum * valueNum) / 100);
    }
    return Math.max(0, originalNum - valueNum);
};

const formatDateForInput = (date: string | Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

export const UpdateUpsell = ({ upsellId, upsells }) => {
    const { addNotification } = useNotificationStore();
    const queryClient = useQueryClient();

    const upsellData = upsells.data.find(u => u._id === upsellId);
    const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
    const setLanguages = useLanguageStore((state) => state.setLanguages);
    const {
        selectedLanguages,
        handleLanguageToggle,
        resetLanguages,
        getFilteredTranslations,
        setSelectedLanguages,
    } = useTranslations({
        translationFields: ['title', 'subtitle', 'description', 'buttonText', 'image', 'buttonLink'],
    });
    useEffect(() => {
        if (fetchedLanguages.length > 0) {
            setLanguages(fetchedLanguages);
        }
    }, [fetchedLanguages, setLanguages]);
    useEffect(() => {
        if (!upsells) return;
        const apiLanguages = useLanguageStore.getState().languages.map(l => l.key);

        const langs = Object.values(upsellData || {})
            .flatMap(obj => obj && typeof obj === 'object' ? Object.keys(obj) : [])
            .filter(key => apiLanguages.includes(key));

        setSelectedLanguages([...new Set(langs)]);
    }, [upsellData, setSelectedLanguages]);

    const { data: allUsersCount } = useQuery(
        ['allUsersCount'],
        () => upsellApi.countUsersByCriteria({ targetType: 'all' }),
        { staleTime: 60000 }
    );

    const { mutate, isLoading, isSuccess } = useMutation(upsellApi.update, {
        onSuccess: () => {
            queryClient.invalidateQueries('upsells');
            addNotification({
                type: 'success',
                title: 'Upsell successfully updated.',
            });
        },
    });
    const initialValues: FormikState = {
        title: upsellData?.title || '',
        titleTranslations: upsellData?.titleTranslations || {},
        subtitle: upsellData?.subtitle || '',
        subtitleTranslations: upsellData?.subtitleTranslations || {},
        description: upsellData?.description || '',
        descriptionTranslations: upsellData?.descriptionTranslations || {},
        image: upsellData?.image || '',
        imageTranslations: upsellData?.imageTranslations || {},
        deleteImage: false,
        deleteImageTranslations: {},
        originalPrice: upsellData?.originalPrice || 0,
        discountType: upsellData?.discountType || 'percent',
        discountValue: upsellData?.discountValue || 0,
        currency: upsellData?.currency || 'USD',
        buttonText: upsellData?.buttonText || '',
        buttonTextTranslations: upsellData?.buttonTextTranslations || {},
        buttonLink: upsellData?.buttonLink || '',
        buttonLinkTranslations: upsellData?.buttonLinkTranslations || {},
        timeType: upsellData?.timeType || 'always',
        startDate: formatDateForInput(upsellData?.startDate),
        endDate: formatDateForInput(upsellData?.endDate),
        durationDays: upsellData?.durationDays || 0,
        durationHours: upsellData?.durationHours || 0,
        targetType: upsellData?.targetType || 'all',
        isActive: upsellData?.isActive ?? true,
        targetCriteria: upsellData?.targetCriteria || defaultTargetCriteria,
        dismissBehavior: upsellData?.dismissBehavior || 'session',
    };

    const formik = useFormik({
        initialValues,
        validationSchema: updateUpsellSchema,
        onSubmit: (v) => onSubmit(v),
    });

    const onSubmit = (state: FormikState) => {
        const translations = getFilteredTranslations(state,true);
        const payload = {
            ...state,
            finalPrice: calculateFinalPrice(state.originalPrice, state.discountType, state.discountValue),
            startDate: state.startDate || null,
            endDate: state.endDate || null,
            titleTranslations: translations?.titleTranslations,
                subtitleTranslations: translations?.subtitleTranslations,
                descriptionTranslations: translations?.descriptionTranslations,
                buttonTextTranslations: translations?.buttonTextTranslations,
                buttonLinkTranslations: translations?.buttonLinkTranslations,
                imageTranslations: translations?.imageTranslations,
        };
        mutate({ upsellId, ...payload });
    };

    const { data: criteriaUsersCount, isLoading: isCriteriaCountLoading } = useQuery(
        ['criteriaUsersCount', formik.values.targetCriteria],
        () => upsellApi.countUsersByCriteria({
            targetType: 'criteria',
            criteria: formik.values.targetCriteria,
        }),
        {
            staleTime: 30000,
            enabled: formik.values.targetType === 'criteria',
        }
    );

    const finalPrice = useMemo(() => {
        return calculateFinalPrice(formik.values.originalPrice, formik.values.discountType, formik.values.discountValue);
    }, [formik.values.originalPrice, formik.values.discountType, formik.values.discountValue]);

    const savings = useMemo(() => {
        return Number(formik.values.originalPrice || 0) - finalPrice;
    }, [formik.values.originalPrice, finalPrice]);

    const getCriteriaCount = () => {
        if (formik.values.targetType !== 'criteria') return null;
        if (isCriteriaCountLoading) return '...';
        return criteriaUsersCount?.count?.toLocaleString() || '0';
    };

    return (
        <Authorization allowedRoles={[ROLES.ADMIN]}>
            <FormDrawer
                isDone={isSuccess}
                triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
                title="Update Upsell"
                submitButton={
                    <Button form="update-upsell" variant="danger" type="submit" size="sm" isLoading={isLoading}>
                        Submit
                    </Button>
                }
            >
                <LanguageSelector
                    selectedLanguages={selectedLanguages}
                    onToggle={handleLanguageToggle}
                />
                <form id="update-upsell" onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <TranslatableInput
                                formik={formik}
                                name="title"
                                translationField="titleTranslations"
                                label="Title"
                                selectedLanguages={selectedLanguages}
                            />
                            {formik.touched.title && formik.errors.title && (
                                <p className="text-red-500 text-xs mt-0.5">{formik.errors.title}</p>
                            )}
                        </div>
                        <div>
                            <TranslatableInput
                                formik={formik}
                                name="subtitle"
                                translationField="subtitleTranslations"
                                label="Subtitle"
                                selectedLanguages={selectedLanguages}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <TranslatableInput
                                formik={formik}
                                name="buttonText"
                                translationField="buttonTextTranslations"
                                label="Button Text"
                                selectedLanguages={selectedLanguages}
                            />
                            {formik.touched.buttonText && formik.errors.buttonText && (
                                <p className="text-red-500 text-xs mt-0.5">{formik.errors.buttonText}</p>
                            )}
                        </div>
                        <div>
                            <TranslatableInput
                                formik={formik}
                                name="buttonLink"
                                translationField="buttonLinkTranslations"
                                label="Button Link"
                                selectedLanguages={selectedLanguages}
                            />
                            {formik.touched.buttonLink && formik.errors.buttonLink && (
                                <p className="text-red-500 text-xs mt-0.5">{formik.errors.buttonLink}</p>
                            )}
                        </div>
                    </div>

                    <div>
                       <TranslatableTextareaWithFormatting
                            formik={formik}
                            name="description"
                            label="Description"
                            selectedLanguages={selectedLanguages}
                            placeholder="Enter description"
                        />
                    </div>

                    <TranslatableDropzone
                        formik={formik}
                        name="image"
                        translationField="imageTranslations"
                        label="Image"
                        selectedLanguages={selectedLanguages}
                    />

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Pricing</h4>
                        <div className="grid grid-cols-4 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Original <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="originalPrice"
                                    value={formik.values.originalPrice}
                                    onChange={formik.handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-bbb focus:border-bbb"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Discount</label>
                                <select
                                    name="discountType"
                                    value={formik.values.discountType}
                                    onChange={formik.handleChange}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-bbb focus:border-bbb"
                                >
                                    <option value="percent">%</option>
                                    <option value="fixed">Fixed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Value <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="discountValue"
                                    value={formik.values.discountValue}
                                    onChange={formik.handleChange}
                                    min="0"
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-bbb focus:border-bbb"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                                <input
                                    type="text"
                                    name="currency"
                                    value={formik.values.currency}
                                    onChange={formik.handleChange}
                                    maxLength={3}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-bbb focus:border-bbb uppercase"
                                />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400 line-through">{formik.values.currency} {Number(formik.values.originalPrice || 0).toFixed(2)}</span>
                                <span className="text-gray-400">→</span>
                                <span className="text-bbb">
                                    -{formik.values.discountType === 'percent' ? `${formik.values.discountValue}%` : `${formik.values.currency} ${Number(formik.values.discountValue || 0).toFixed(2)}`}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="font-bold text-bbb">{formik.values.currency} {finalPrice.toFixed(2)}</span>
                            </div>
                            {savings > 0 && (
                                <span className="text-xs text-bbb bg-bbb/10 px-2 py-1 rounded-full">
                                    Save {formik.values.currency} {savings.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Timing</h4>
                        <div className="flex gap-2 mb-3">
                            {[
                                { value: 'always', label: 'Always' },
                                { value: 'date_range', label: 'Date Range' },
                                { value: 'duration', label: 'Duration' },
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => formik.setFieldValue('timeType', value)}
                                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${formik.values.timeType === value
                                        ? 'bg-bbb text-white border-bbb'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-bbb'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {formik.values.timeType === 'date_range' && (
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Start</label>
                                    <input type="date" name="startDate" value={formik.values.startDate} onChange={formik.handleChange} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-bbb focus:border-bbb" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">End</label>
                                    <input type="date" name="endDate" value={formik.values.endDate} onChange={formik.handleChange} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-bbb focus:border-bbb" />
                                </div>
                            </div>
                        )}
                        {formik.values.timeType === 'duration' && (
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Days</label>
                                    <input type="number" name="durationDays" value={formik.values.durationDays} onChange={formik.handleChange} min="0" className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-bbb focus:border-bbb" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Hours</label>
                                    <input type="number" name="durationHours" value={formik.values.durationHours} onChange={formik.handleChange} min="0" max="23" className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-bbb focus:border-bbb" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                            When Dismissed
                        </h4>
                        <div className="flex gap-2 mb-3">
                            {[
                                { value: 'session', label: 'Show next session' },
                                { value: 'days_30', label: 'Show after 30 Days' },
                                { value: 'never', label: 'Never Show Again' },
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => formik.setFieldValue('dismissBehavior', value)}
                                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${formik.values.dismissBehavior === value
                                        ? 'bg-bbb text-white border-bbb'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-bbb'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Targeting</h4>
                        <div className="flex gap-2 mb-3">
                            <button
                                type="button"
                                onClick={() => formik.setFieldValue('targetType', 'all')}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-2 ${formik.values.targetType === 'all'
                                    ? 'bg-bbb text-white border-bbb'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-bbb'
                                    }`}
                            >
                                <span>All Users</span>
                                {allUsersCount?.count !== undefined && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${formik.values.targetType === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                        {allUsersCount.count.toLocaleString()}
                                    </span>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => formik.setFieldValue('targetType', 'criteria')}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-2 ${formik.values.targetType === 'criteria'
                                    ? 'bg-bbb text-white border-bbb'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-bbb'
                                    }`}
                            >
                                <span>By Criteria</span>
                                {formik.values.targetType === 'criteria' && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isCriteriaCountLoading ? 'bg-white/20 text-white' : criteriaUsersCount?.count > 0 ? 'bg-white/20 text-white' : 'bg-red-400 text-white'}`}>
                                        {getCriteriaCount()}
                                    </span>
                                )}
                            </button>
                        </div>
                        {formik.values.targetType === 'criteria' && (
                            <CriteriaBuilder
                                criteria={formik.values.targetCriteria}
                                onChange={(newCriteria) => formik.setFieldValue('targetCriteria', newCriteria)}
                            />
                        )}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Active</span>
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formik.values.isActive}
                                onChange={() => formik.setFieldValue('isActive', !formik.values.isActive)}
                            />
                            <div className={`relative w-11 h-6 rounded-full transition-colors ${formik.values.isActive ? 'bg-bbb' : 'bg-gray-300'}`}>
                                <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formik.values.isActive ? 'translate-x-5' : ''}`} />
                            </div>
                            <span className={`ml-2 text-sm font-medium ${formik.values.isActive ? 'text-bbb' : 'text-gray-500'}`}>
                                {formik.values.isActive ? 'Yes' : 'No'}
                            </span>
                        </label>
                    </div>
                </form>
            </FormDrawer>
        </Authorization>
    );
};