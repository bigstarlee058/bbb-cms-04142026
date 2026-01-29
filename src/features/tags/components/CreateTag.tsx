import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation, useQuery } from 'react-query';
import { queryClient } from '@/lib/react-query';
import { useEffect } from 'react';
import { Button } from '@/components/Elements';
import { FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createTagsSchema } from '@/utils/yup';

import { createTag } from '../api';
import { prepareTranslations } from '@/utils/translationHelper';
import { useLanguageStore } from '@/stores/languages';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { useTranslations } from '@/hooks/useTranslations';
interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
}

export const CreateTag = () => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const {
    selectedLanguages,
    handleLanguageToggle,
    resetLanguages,
    getFilteredTranslations,
  } = useTranslations({
    translationFields: ['title'],
  });

  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);
  const { mutate, isLoading, isSuccess } = useMutation(createTag, {
    onSuccess: () => {
      queryClient.invalidateQueries('get-categories');
      resetLanguages();
      formik.resetForm();
      addNotification({
        type: 'success',
        title: "Tag successfully created.",
      });
    },
  });
  const initialValues: FormikState = {
    title: '',
    titleTranslations: {},
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createTagsSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (values: any) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title'],
      imageFields: [],
    });
    const payload = {
      ...values, titleTranslations: translations?.titleTranslations
    };
    mutate(payload);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Tag
          </Button>
        }
        title="Create Tag"
        submitButton={
          <Button form="create-tag" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="create-tag" onSubmit={formik.handleSubmit}>
          <TranslatableInput
            formik={formik}
            name="title"
            translationField="titleTranslations"
            label="Title"
            selectedLanguages={selectedLanguages}
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
