import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation, useQuery } from 'react-query';
import { Button } from '@/components/Elements';
import { FormDrawer, Dropzone, Textarea } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createPhasesSchema } from '@/utils/yup';
import { createPhases } from '../api';
import { fetchLanguages } from '@/lib/api';
import { useLanguageStore } from '@/stores/languages';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { useTranslations } from '@/hooks/useTranslations';
import { prepareTranslations } from '@/utils/translationHelper';
import { queryClient } from '@/lib/react-query';
import { useEffect } from 'react';

interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  image: any;
  deleteImage: boolean;
}

export const CreateSection = () => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  
  const {
    selectedLanguages,
    handleLanguageToggle,
    getFilteredTranslations,
    resetLanguages,
  } = useTranslations({
    translationFields: ['title', 'description'],
  });

  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);

  const { mutate, isLoading, isSuccess } = useMutation(createPhases, {
    onSuccess: () => {
      queryClient.invalidateQueries('get-sections');
      resetLanguages();
      formik.resetForm();
      addNotification({
        type: 'success',
        title: "Section successfully created."
      });
    }
  });
  const initialValues: FormikState = {
    title: '',
    titleTranslations: {},
    description: '',
    descriptionTranslations: {},
    image: '',
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createPhasesSchema,
    onSubmit: (v) => onSubmit(v)
  });

  const onSubmit = (values: any) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title', 'description'],
      imageFields: [],
    });
    const payload = {
      ...values,
      ...translations,
    };
    mutate(payload);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Phases
          </Button>
        }
        title="Create Phases"
        submitButton={
          <Button form="create-section" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="create-section" onSubmit={formik.handleSubmit}>
          <TranslatableInput
            formik={formik}
            name="title"
            translationField="titleTranslations"
            label="Title"
            selectedLanguages={selectedLanguages}
          />
          <Dropzone
            label="Thumbnail"
            name="image"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
          <TranslatableInput
            formik={formik}
            name="description"
            translationField="descriptionTranslations"
            label="Description"
            selectedLanguages={selectedLanguages}
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
