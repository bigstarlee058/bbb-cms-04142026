import { useEffect } from 'react';
import { fetchLanguages } from '@/lib/api';
import { useLanguageStore } from '@/stores/languages';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslatableTextareaWithFormatting } from '@/components/Form/TranslatableTextareaWithFormatting';
import { prepareTranslations } from '@/utils/translationHelper';
import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation, useQuery } from 'react-query';
import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone,Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createStaffSchema } from '@/utils/yup';
import { createStaff } from '../api';
import { SelectOption } from '@/types';

interface FormikState {
  title: string;
  location: string;
  type: number;
  bio: string;
  bioTranslations: Record<string, string>;
  deleteImage: boolean;
  photo: any;
  link: string;
  linkedin:string;
  tiktok:string;
  facebook:string;
  twitter:string;
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

export const CreateStaff = () => {
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
  } = useTranslations({
    translationFields: ['bio'],
  });
  const { mutate, isLoading, isSuccess } = useMutation(createStaff, {
    onSuccess: (message: string) => {
      resetLanguages();
      formik.resetForm();
      addNotification({
        type: 'success',
        title: message
      });
    }
  });
  const initialValues: FormikState = {
    title: '',
    location:'',
    photo: '',
    type: 0,
    bio: '',
    bioTranslations: {},
    link: '',
    linkedin:'',
    tiktok:'',
    facebook:'',
    twitter:'',
    deleteImage: false
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createStaffSchema,
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
    const payload = { ...values, ...translations };
    mutate(payload);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Staff
          </Button>
        }
        title="Create Staff"
        submitButton={
          <Button form="create-staff" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="create-staff" onSubmit={formik.handleSubmit}>
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
