import { useEffect } from 'react';
import { useFormik } from 'formik';
import { useMutation, useQuery } from 'react-query';
import { PlusIcon } from '@heroicons/react/outline';
import { useNotificationStore } from '@/stores/notifications';
import { createBonusSchema } from '@/utils/yup';
import { Authorization, ROLES } from '@/lib/authorization';
import { Button } from '@/components/Elements';
import { FormDrawer, Dropzone } from '@/components/Form';
import { createBonus } from '../api';
import { fetchLanguages } from '@/lib/api';
import { useLanguageStore } from '@/stores/languages';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { TranslatableTextarea } from '@/components/Form/TranslatableTextarea';
import { prepareTranslations } from '@/utils/translationHelper';
import { ToggleField } from '../../challenges/components/ToggleField';

interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  thumbnail: string;
  deleteThumbnail: boolean;
  isFeatured: boolean;
}

export const CreateBonus = () => {
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
    translationFields: ['title', 'description'],
  });

  const { mutate, isLoading, isSuccess } = useMutation(createBonus, {
    onSuccess: (message: string) => {
      formik.resetForm();
      resetLanguages();
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const initialValues: FormikState = {
    title: '',
    titleTranslations: {},
    description: '',
    descriptionTranslations: {},
    thumbnail: '',
    deleteThumbnail: false,
    isFeatured: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createBonusSchema,
    onSubmit: (values) => onSubmit(values),
  });

  const onSubmit = (values: FormikState) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title', 'description'],
      imageFields: [],
    });
    const payload = { ...values, ...translations };
    mutate(payload);
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        onClose={() => {
          formik.resetForm();
          resetLanguages();
        }}
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Bonus
          </Button>
        }
        title="Create Bonus"
        submitButton={
          <Button form="create-bonus" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="create-bonus" onSubmit={formik.handleSubmit}>
          <TranslatableInput
            formik={formik}
            name="title"
            translationField="titleTranslations"
            label="Title"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableTextarea
            formik={formik}
            name="description"
            translationField="descriptionTranslations"
            label="Description"
            selectedLanguages={selectedLanguages}
          />
          <Dropzone
            label="Thumbnail"
            name="thumbnail"
            formik={formik}
            defaultImg={formik.values.thumbnail}
            onDrop={(img) => formik.setFieldValue('thumbnail', img)}
            onDelete={() =>
              formik.setValues({ ...formik.values, thumbnail: '', deleteThumbnail: true })
            }
          />
          <ToggleField
            label="Featured"
            value={formik.values.isFeatured}
            onChange={(v) => formik.setFieldValue('isFeatured', v)}
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
