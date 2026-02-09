import { useFormik } from 'formik';
import { useMutation } from 'react-query';
import { PlusIcon } from '@heroicons/react/outline';
import { useNotificationStore } from '@/stores/notifications';
import { createCollectionSchema } from '@/utils/yup';
import { Authorization, ROLES } from '@/lib/authorization';
import { Button } from '@/components/Elements';
import { FormDrawer} from '@/components/Form';
import { createCollection } from '../api';
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
  thumbnail: any;
  thumbnailTranslations: Record<string, any>;
  deleteThumbnail: boolean;
  deleteThumbnailTranslations: Record<string, boolean>;
  isFeatured: boolean;
}

export const CreateCollection = () => {
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
    translationFields: ['title', 'description', 'thumbnail'],
  });
  const { mutate, isLoading, isSuccess } = useMutation(createCollection, {
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
    thumbnailTranslations: {},
    deleteThumbnail: false,
    deleteThumbnailTranslations: {},
    isFeatured: false,
  };
  const formik = useFormik({
    initialValues,
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
    const payload = { ...values, ...translations };
    mutate(payload);
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Collection
          </Button>
        }
        title="Create Collection"
        submitButton={
          <Button form="create-collection" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="create-collection" onSubmit={formik.handleSubmit}>
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
