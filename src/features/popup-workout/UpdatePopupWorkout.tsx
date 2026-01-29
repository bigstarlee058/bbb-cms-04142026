import { PencilIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation, useQuery } from 'react-query';
import { useEffect } from 'react';
import { Button } from '@/components/Elements';
import { FormDrawer, } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { updatePopupInfo } from './api';
import { useLanguageStore } from '@/stores/languages';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { TranslatableTextareaWithFormatting } from '@/components/Form/TranslatableTextareaWithFormatting';
import { queryClient } from '@/lib/react-query';
interface FormikState {
  vimeo: string;
  vimeoTranslations: Record<string, string>;
  title: string;
  titleTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
}

export const UpdatePopupWorkout = ({ screenData }) => {
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
    translationFields: ['title', 'description','vimeo'],
  });
  useEffect(() => {
    const apiLanguages = useLanguageStore.getState().languages.map(l => l.key);

    const langs = Object.values(screenData || {})
      .flatMap(obj => obj && typeof obj === 'object' ? Object.keys(obj) : [])
      .filter(key => apiLanguages.includes(key));

    setSelectedLanguages([...new Set(langs)]);
  }, [screenData, setSelectedLanguages]);
  const initialValues: FormikState = {
    vimeo: screenData?.vimeoId || '',
    vimeoTranslations: screenData?.vimeoTranslations || {},
    title: screenData?.title || '',
    titleTranslations: screenData?.titleTranslations || {},
    description: screenData?.description || '',
    descriptionTranslations: screenData?.descriptionTranslations || {},
  };

  const formik = useFormik({
    initialValues,
    onSubmit: (v) => onSubmit(v),
    enableReinitialize: true 
  });

  const { mutate, isLoading, isSuccess } = useMutation(updatePopupInfo, {
    onSuccess: (message: string) => {
      queryClient.invalidateQueries('get-popupworkout');
      resetLanguages();
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const onSubmit = (state: FormikState) => {
    const { vimeo, title, description } = state;
    const translations = getFilteredTranslations(state,true);
    const {vimeoTranslations,titleTranslations,descriptionTranslations}=translations;
    
    mutate({ vimeo, title, description ,vimeoTranslations,titleTranslations,descriptionTranslations});
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PencilIcon className="h-4 w-4" />}>
            &nbsp;Update Information
          </Button>
        }
        title="Update Information"
        submitButton={
          <Button form="update-information" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="update-information" onSubmit={formik.handleSubmit}>
          <TranslatableInput
            formik={formik}
            name="vimeo"
            translationField="vimeoTranslations"
            label="Vimeo Id"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableInput
            formik={formik}
            name="title"
            translationField="titleTranslations"
            label="Title"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableTextareaWithFormatting
            formik={formik}
            name="description"
            label="Description"
            selectedLanguages={selectedLanguages}
            placeholder="Enter description"
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
