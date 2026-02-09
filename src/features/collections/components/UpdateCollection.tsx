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
import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import { updateCollection } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createCollectionSchema } from '@/utils/yup';

interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  thumbnail: any;
  thumbnailTranslations: Record<string, any>;
  deleteImage: boolean;
  deleteImageTranslations: Record<string, boolean>;
  isFeatured: boolean;
}

export const UpdateCollection = ({ collectionId, collections }) => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);

  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);
  const collectionData = collections.collections.find(cd => cd._id === collectionId);
  const {
    selectedLanguages,
    handleLanguageToggle,
    getFilteredTranslations,
    resetLanguages,
    setSelectedLanguages,
  } = useTranslations({
    translationFields: ['title', 'description', 'thumbnail'],
  });

  const syncLanguages = () => {
    const apiLanguages = fetchedLanguages.map(l => l.key);
    const foundLangs = Object.values(collectionData || {})
      .flatMap(obj => obj && typeof obj === 'object' ? Object.keys(obj) : [])
      .filter(key => apiLanguages.includes(key));

    if (foundLangs.length > 0) setSelectedLanguages([...new Set(foundLangs)]);
    else resetLanguages();
  };

  useEffect(() => {
    syncLanguages();
  }, [collectionData, fetchedLanguages]);
  const { mutate, isLoading, isSuccess } = useMutation(updateCollection, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });


  const initialValues: FormikState = {
    title: collectionData?.title || '',
    titleTranslations: collectionData?.titleTranslations || {},
    description: collectionData?.description || '',
    descriptionTranslations: collectionData?.descriptionTranslations || {},
    thumbnail: collectionData?.thumbnail || '',
    thumbnailTranslations: collectionData?.thumbnailTranslations || {},
    deleteImage: false,
    deleteImageTranslations: {},
    isFeatured: collectionData?.isFeatured || false,
  };
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: createCollectionSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (values: FormikState) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title', 'description'],
      imageFields: ['thumbnail'],
    });
    console.log(translations)
    mutate({
      collectionId, ...values,
      ...translations
    });
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Collection"
        submitButton={
          <Button form="update-collection" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="update-collection" onSubmit={formik.handleSubmit}>
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
          <TranslatableDropzone
            formik={formik}
            name="thumbnail"
            translationField="thumbnailTranslations"
            label="Thumbnail"
            selectedLanguages={selectedLanguages}
          />
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Featured</label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formik.values.isFeatured}
                onChange={() => formik.setFieldValue('isFeatured', !formik.values.isFeatured)}
              />
              <div
                className={`relative w-11 h-6 rounded-full transition-colors 
          ${formik.values.isFeatured ? 'bg-bbb' : 'bg-gray-300'}`}
              >
                <span
                  className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform 
            ${formik.values.isFeatured ? 'translate-x-5' : ''}`}
                />
              </div>
              <span
                className={`ml-2 text-sm font-medium ${formik.values.isFeatured ? 'text-bbb' : 'text-gray-900'}`}
              >
                {formik.values.isFeatured ? 'Yes' : 'No'}
              </span>
            </label>
          </div>
        </form>
      </FormDrawer>
    </Authorization>
  );
};
