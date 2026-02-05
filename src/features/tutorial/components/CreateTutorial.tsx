import { useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation, useQuery } from 'react-query';
import { Button } from '@/components/Elements';
import { FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createTutorialSchema } from '@/utils/yup';
import { useLanguageStore } from '@/stores/languages';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslatableDropzone } from '@/components/Form/TranslatableDropzone';
import { TranslatableTextarea } from '@/components/Form/TranslatableTextarea';
import { createTutorial } from '../api';
import { Select } from '@/components/Form/Select';
import { queryClient } from '@/lib/react-query';
import { prepareTranslations } from '@/utils/translationHelper';
interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  category: number;
  vimeoId: string;
  vimeoIdTranslations: Record<string, string>;
  deleteImage: boolean;
  deleteImageTranslations: Record<string, boolean>;
  image: any;
  imageTranslations: Record<string, string>;
}

export const CreateTutorial = () => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const {
    selectedLanguages,
    handleLanguageToggle,
    getFilteredTranslations,
    resetLanguages,
  } = useTranslations({
    translationFields: ['title', 'description', 'vimeoId', 'image'],
  });
  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);
  const { mutate, isLoading, isSuccess } = useMutation(createTutorial, {
    onSuccess: () => {
      queryClient.invalidateQueries('get-tutorials');
      formik.resetForm();
      addNotification({
        type: 'success',
        title: "Tutorial successfully created.",
      });
    },
  });
  const initialValues: FormikState = {
    title: '',
    titleTranslations: {},
    description: '',
    descriptionTranslations: {},
    category: 0,
    vimeoId: '',
    vimeoIdTranslations: {},
    image: '',
    imageTranslations: {},
    deleteImage: false,
    deleteImageTranslations: {}
  };
  const categoryOptions = [
    { value: 0, label: 'Tutorials' },
    { value: 1, label: 'Nutrition Tutorials' },
  ];
  const formik = useFormik({
    initialValues,
    validationSchema: createTutorialSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const handleClose = () => {
    formik.resetForm();
    resetLanguages();
  }

  const onSubmit = (values: FormikState) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title', 'description', 'vimeoId'],
      imageFields: ['image'],
    });

    // Build complete payload
    const payload = {
      ...values,
      ...translations,
    };

    mutate(payload);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        onClose={handleClose}
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Tutorial
          </Button>
        }
        title="Create Tutorial"
        submitButton={
          <Button form="create-tutorial" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="create-tutorial" onSubmit={formik.handleSubmit}>
          <Select
            label="Category"
            formik={formik}
            name="category"
            options={categoryOptions}
            value={categoryOptions.find(option => option.value === formik.values.category)}
            onChange={(option: any) => formik.setFieldValue('category', option.value)}
          />
          <TranslatableInput
            formik={formik}
            name="title"
            translationField="titleTranslations"
            label="Title"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableInput
            formik={formik}
            name="vimeoId"
            translationField="vimeoIdTranslations"
            label="Vimeo Id"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableDropzone
            formik={formik}
            name="image"
            translationField="imageTranslations"
            label="Thumbnail"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableTextarea label="Description" formik={formik} name={`description`}
            translationField={`descriptionTranslations`}
            selectedLanguages={selectedLanguages}
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
