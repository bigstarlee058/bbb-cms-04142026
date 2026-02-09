import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { fetchLanguages } from '@/lib/api';
import { useLanguageStore } from '@/stores/languages';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslatableTextareaWithFormatting } from '@/components/Form/TranslatableTextareaWithFormatting';
import { prepareTranslations } from '@/utils/translationHelper';
import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import { updateStaff } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createStaffSchema } from '@/utils/yup';
import { SelectOption } from '@/types';

interface FormikState {
  title: string;
  location: string;
  type: number;
  bio: string;
  bioTranslations: Record<string, string>;
  photo?: any;
  link: string;
  linkedin: string;
  tiktok: string;
  facebook: string;
  twitter: string;
  deleteImage: boolean;
}

const COACH_TYPE_OPTIONS: SelectOption[] = [
  {
    label: 'Staff',
    value: '1'
  },
  {
    label: 'Athlete',
    value: '2'
  }
];

export const UpdateStaff = ({ staffId, staffs }) => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);

  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);

  const {
    selectedLanguages,
    handleLanguageToggle,
    getFilteredTranslations,
    resetLanguages,
    setSelectedLanguages,
  } = useTranslations({
    translationFields: ['bio'],
  });

  const staffData = staffs.staffs.find((st) => st._id === staffId);

  const syncLanguages = () => {
    const apiLanguages = fetchedLanguages.map(l => l.key);
    const foundLangs = Object.values(staffData || {})
      .flatMap(obj => obj && typeof obj === 'object' ? Object.keys(obj) : [])
      .filter(key => apiLanguages.includes(key));

    if (foundLangs.length > 0) setSelectedLanguages([...new Set(foundLangs)]);
    else resetLanguages();
  };

  useEffect(() => {
    syncLanguages();
  }, [staffData, fetchedLanguages]);
  const { mutate, isLoading, isSuccess } = useMutation(updateStaff, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const initialValues: FormikState = {
    title: staffData?.title || '',
    location: staffData?.location || '',
    type: staffData?.type || 0,
    bio: staffData?.bio || '',
    bioTranslations: staffData?.bioTranslations || {},
    photo: staffData?.photo || '',
    link: staffData?.link || '',
    linkedin: staffData?.linkedin || '',
    tiktok: staffData?.tiktok || '',
    facebook: staffData?.facebook || '',
    twitter: staffData?.twitter || '',
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createStaffSchema,
    enableReinitialize: true,
    onSubmit: (v) => onSubmit(v)
  });
  const onSubmit = (values: FormikState) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['bio'],
      imageFields: [],
    });
    const payload = { staffId, ...values, ...translations }
    mutate(payload);
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Staff"
        submitButton={
          <Button form="update-staff" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="update-staff" onSubmit={formik.handleSubmit}>
          <Field label="Name" formik={formik} name="title" />
          <Field label="Location" formik={formik} name="location" />
          <TranslatableTextareaWithFormatting
            formik={formik}
            name="bio"
            translationField="bioTranslations"
            label="Bio"
            selectedLanguages={selectedLanguages}
          />
          <Dropzone
            label="Photo"
            name="photo"
            formik={formik}
            defaultImg={formik.values.photo}
            onDrop={(img) => formik.setFieldValue('photo', img)}
            onDelete={() => formik.setValues({ ...formik.values, photo: '', deleteImage: true })}
          />
          <Select
            formik={formik}
            label="Coach Type"
            name="type"
            options={COACH_TYPE_OPTIONS}
            value={
              formik.values.type == 1
                ? { label: COACH_TYPE_OPTIONS[0].label, value: COACH_TYPE_OPTIONS[0].value }
                : { label: COACH_TYPE_OPTIONS[1].label, value: COACH_TYPE_OPTIONS[1].value }
            }
            onChange={({ value }: SelectOption) => formik.setFieldValue('type', value)}
          />
          <Field label="Button Link" formik={formik} name="link" />
          <Field label="Linkedin" formik={formik} name="linkedin" />
          <Field label="Tiktok" formik={formik} name="tiktok" />
          <Field label="Facebook" formik={formik} name="facebook" />
          <Field label="Twitter" formik={formik} name="twitter" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
