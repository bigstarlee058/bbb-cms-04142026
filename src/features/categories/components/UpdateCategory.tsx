import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { FormDrawer, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery } from 'react-query';
import { updateCategory } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createCategorySchema } from '@/utils/yup';
import { useLanguageStore } from '@/stores/languages';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { useTranslations } from '@/hooks/useTranslations';
import { prepareTranslations } from '@/utils/translationHelper';
import { queryClient } from '@/lib/react-query';
import { useEffect } from 'react';
interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  thumbnail?: any;
  deleteImage: boolean;
}

export const UpdateCategory = ({ categoryId, categories }) => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const {
    selectedLanguages,
    handleLanguageToggle,
    resetLanguages,
    getFilteredTranslations,
    setSelectedLanguages,
  } = useTranslations({
    translationFields: ['title'],
  });

  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);
  const { mutate, isLoading, isSuccess } = useMutation(updateCategory, {
    onSuccess: (message: string) => {
      queryClient.invalidateQueries('get-categories');
      resetLanguages();
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const categoryData = categories.categories.find(ca => ca._id === categoryId);
  useEffect(() => {
    if (!categories) return;
    const apiLanguages = useLanguageStore.getState().languages.map(l => l.key);

    const langs = Object.values(categoryData || {})
      .flatMap(obj => obj && typeof obj === 'object' ? Object.keys(obj) : [])
      .filter(key => apiLanguages.includes(key));

    setSelectedLanguages([...new Set(langs)]);
  }, [categoryData, setSelectedLanguages]);
  const initialValues: FormikState = {
    title: categoryData?.title || '',
    titleTranslations: categoryData?.titleTranslations || {},
    thumbnail: categoryData?.thumbnail || '',
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createCategorySchema,
    onSubmit: (v) => onSubmit(v),
  });
  console.log()
  const onSubmit = (values: FormikState) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title'],
      imageFields: ['thumbnail'],
    });
    const payload = {
      ...values, ...translations
    }
    mutate({ categoryId, payload });
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Category"
        submitButton={
          <Button form="update-category" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="update-category" onSubmit={formik.handleSubmit}>
          <TranslatableInput
            formik={formik}
            name="title"
            translationField="titleTranslations"
            label="Title"
            selectedLanguages={selectedLanguages}
          />
          <Dropzone
            label="Thumbnail"
            name="thumbnail"
            formik={formik}
            defaultImg={formik.values.thumbnail}
            onDrop={(img) => formik.setFieldValue('thumbnail', img)}
            onDelete={() => formik.setValues({ ...formik.values, thumbnail: '', deleteImage: true })}
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
