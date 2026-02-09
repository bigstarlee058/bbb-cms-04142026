import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';
import { Button } from '@/components/Elements';
import { FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createChallengeSchema } from '@/utils/yup';
import { createChallenge } from '../api';
import { ToggleField } from './ToggleField';
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { fetchLanguages } from '@/lib/api';
import { useLanguageStore } from '@/stores/languages';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { TranslatableTextarea } from '@/components/Form/TranslatableTextarea';
import { TranslatableDropzone } from '@/components/Form/TranslatableDropzone';
import { prepareTranslations } from '@/utils/translationHelper';
interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  link: string;
  linkTranslations: Record<string, string>;
  buttonText: string;
  buttonTextTranslations: Record<string, string>;
  deleteImage: boolean;
  photo: any;
  photoTranslations: Record<string, any>;
  isHide: false;
}

export const CreateChallenge = () => {
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
    translationFields: ['title', 'description', 'photo', 'link', 'buttonText'],
  });
  const { mutate, isLoading, isSuccess } = useMutation(createChallenge, {
    onSuccess: (message: string) => {
      formik.resetForm();
      resetLanguages();
      addNotification({
        type: 'success',
        title: message
      });
    }
  });
  const initialValues: FormikState = {
    title: '',
    titleTranslations: {},
    photo: '',
    photoTranslations: {},
    description: '',
    descriptionTranslations: {},
    link: '',
    linkTranslations: {},
    buttonText: '',
    buttonTextTranslations: {},
    deleteImage: false,
    isHide: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createChallengeSchema,
    onSubmit: (v) => onSubmit(v)
  });
  const onSubmit = (values: FormikState) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title', 'description', 'link', 'buttonText'],
      imageFields: ['photo'],
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
            Create Challenge
          </Button>
        }
        title="Create Challenge"
        submitButton={
          <Button form="create-challenge" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="create-challenge" onSubmit={formik.handleSubmit}>
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
          <TranslatableInput
            formik={formik}
            name="link"
            translationField="linkTranslations"
            label="Link"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableInput
            formik={formik}
            name="buttonText"
            translationField="buttonTextTranslations"
            label="Button Text"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableDropzone
            formik={formik}
            name="photo"
            translationField="photoTranslations"
            label="Photo"
            selectedLanguages={selectedLanguages}
          />
          <ToggleField
            label="Visible"
            value={formik.values.isHide}
            onChange={(v) => formik.setFieldValue('isHide', v)}
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
