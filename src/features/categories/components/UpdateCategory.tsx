import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import {  FormDrawer, Dropzone } from '@/components/Form';
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
  image?: any;
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

  const categoryData = categories.categories.find(ex => ex._id === categoryId);

  const initialValues: FormikState = {
    title: categoryData?.title || '',
    titleTranslations: categoryData?.titleTranslations || {},
    image: categoryData?.image || '',
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createCategorySchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (values: FormikState) => {
  const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title'],
      imageFields: ['image'],
    });
    const payload = {
      ...values, ...translations
    }
    mutate({categoryId,payload});
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
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
