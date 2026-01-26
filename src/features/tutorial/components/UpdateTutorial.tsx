import { useEffect } from 'react';
import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import {  FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery } from 'react-query';
import { updateTutorial } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createTutorialSchema } from '@/utils/yup';
import { Select } from '@/components/Form/Select';
import { useLanguageStore } from '@/stores/languages';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { TranslatableDropzone } from '@/components/Form/TranslatableDropzone';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslatableTextarea } from '@/components/Form/TranslatableTextarea';
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

export const UpdateTutorial = ({ tutorialId, tutorials }) => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);

  const { mutate, isLoading, isSuccess } = useMutation(updateTutorial, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const tutorialData = tutorials.tutorials.find(ex => ex._id === tutorialId);
  const {
    selectedLanguages,
    handleLanguageToggle,
    getFilteredTranslations,
    resetLanguages,
    setSelectedLanguages,
  } = useTranslations({
    translationFields: ['title','description','vimeoId','image'],
  });  
  const syncLanguages = () => {
    const apiLanguages = fetchedLanguages.map(l => l.key);
    const foundLangs = Object.values(tutorialData || {})
        .flatMap(obj => obj && typeof obj === 'object' ? Object.keys(obj) : [])
        .filter(key => apiLanguages.includes(key));

    if (foundLangs.length > 0) setSelectedLanguages([...new Set(foundLangs)]);
    else resetLanguages();
  };
    useEffect(() => {
    syncLanguages();
  }, [tutorialData, fetchedLanguages]);
  const initialValues: FormikState = {
    title: tutorialData?.title || '',
    titleTranslations: tutorialData?.titleTranslations || {},
    description: tutorialData?.description || '',
    descriptionTranslations: tutorialData?.descriptionTranslations || {},
    category: tutorialData?.category || 0,
    vimeoId: tutorialData?.vimeoId || '',
    vimeoIdTranslations: tutorialData?.vimeoIdTranslations || {},
    image: tutorialData?.thumbnail || '',
    imageTranslations: tutorialData?.thumbnailTranslations || {},
    deleteImage: false,
    deleteImageTranslations: {},
  };
  const categoryOptions = [
    { value: 0, label: 'Tutorials' },
    { value: 1, label: 'Nutrition Tutorials' },
  ];
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: createTutorialSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (state: FormikState) => {
    const translations = getFilteredTranslations(state,true);
    const {titleTranslations,vimeoIdTranslations,descriptionTranslations,imageTranslations}=translations;
    const { title, vimeoId, category, description, image, deleteImage } = state;
    mutate({ tutorialId, title, category, vimeoId, description, image, deleteImage,
      titleTranslations,vimeoIdTranslations,descriptionTranslations,imageTranslations
     });
  };
  const handleClose = () => {
    formik.resetForm();
    syncLanguages();
  }
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
      key={tutorialId}
        onClose={() => {
          handleClose();
        }}
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Tutorial"
        submitButton={
          <Button form="update-tutorial" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="update-tutorial" onSubmit={formik.handleSubmit}>
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
