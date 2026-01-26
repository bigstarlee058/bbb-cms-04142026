import { PencilIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import { queryClient } from '@/lib/react-query';
import { Button } from '@/components/Elements';
import { FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { updatePopupNewJoin } from './api';
import { useLanguageStore } from '@/stores/languages';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { TranslatableTextareaWithFormatting } from '@/components/Form/TranslatableTextareaWithFormatting';
import { TranslatableDropzone } from '@/components/Form/TranslatableDropzone';

interface FormikState {
  imgUrl?: any;
  imgUrlTranslations: Record<string, any>;
  deleteImgUrl: boolean;
  deleteImgUrlTranslations: Record<string, boolean>;
  title: string;
  titleTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  buttonText: string;
  buttonTextTranslations: Record<string, string>;
}

export const UpdatePopupNewJoin = ({ screenData }) => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const {
    selectedLanguages,
    handleLanguageToggle,
    getFilteredTranslations,
    setSelectedLanguages,
  } = useTranslations({
    translationFields: ['title', 'description', 'buttonText', 'imgUrl'],
  });
  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);

  useEffect(() => {
        if (!screenData) return;
        const apiLanguages = useLanguageStore.getState().languages.map(l => l.key);

        const langs = Object.values(screenData || {})
            .flatMap(obj => obj && typeof obj === 'object' ? Object.keys(obj) : [])
            .filter(key => apiLanguages.includes(key));

        setSelectedLanguages([...new Set(langs)]);
    }, [screenData, setSelectedLanguages]);

  const initialValues: FormikState = {
    imgUrl: screenData?.imgUrl || '',
    imgUrlTranslations: screenData?.imgUrlTranslations || {},
    deleteImgUrl: false,
    deleteImgUrlTranslations: {},
    title: screenData?.title || '',
    titleTranslations: screenData?.titleTranslations || {},
    description: screenData?.description || '',
    descriptionTranslations: screenData?.descriptionTranslations || {},
    buttonText: screenData?.buttonText || '',
    buttonTextTranslations: screenData?.buttonTextTranslations || {},
  };

  const formik = useFormik({
    initialValues,
    onSubmit: (v) => onSubmit(v),
    enableReinitialize: true
  });

  const { mutate, isLoading, isSuccess } = useMutation(updatePopupNewJoin, {
    onSuccess: (message: string) => {
      queryClient.invalidateQueries('get-popupnewjoin');
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const onSubmit = (state: FormikState) => {
    const { imgUrl, deleteImgUrl, deleteImgUrlTranslations, title, description, buttonText } = state;
    const translations = getFilteredTranslations(state,true);
    const { imgUrlTranslations, titleTranslations, descriptionTranslations, buttonTextTranslations } = translations;

    mutate({
      imgUrl,
      imgUrlTranslations,
      deleteImgUrl,
      deleteImgUrlTranslations,
      title,
      titleTranslations,
      description,
      descriptionTranslations,
      buttonText,
      buttonTextTranslations,
    });
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PencilIcon className="h-4 w-4" />}>
            &nbsp;Update Popup
          </Button>
        }
        title="Popup New Join Users"
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
          <TranslatableDropzone
            formik={formik}
            name="imgUrl"
            translationField="imgUrlTranslations"
            label="Image"
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
          <TranslatableInput
            formik={formik}
            name="buttonText"
            translationField="buttonTextTranslations"
            label="Button Text"
            selectedLanguages={selectedLanguages}
          />

        </form>
      </FormDrawer>
    </Authorization>
  );
};