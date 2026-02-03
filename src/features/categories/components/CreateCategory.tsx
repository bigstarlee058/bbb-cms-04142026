import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation, useQuery } from 'react-query';
import { useEffect } from 'react';
import { Button } from '@/components/Elements';
import { FormDrawer, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createCategorySchema } from '@/utils/yup';
import { queryClient } from '@/lib/react-query';
import { createCategory } from '../api';
import { useLanguageStore } from '@/stores/languages';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { useTranslations } from '@/hooks/useTranslations';
import { prepareTranslations } from '@/utils/translationHelper';
interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  deleteImage: boolean;
  thumbnail: any;
}

export const CreateCategory = () => {
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
  const { mutate, isLoading, isSuccess } = useMutation(createCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries('get-categories');
      resetLanguages();
      formik.resetForm();
      addNotification({
        type: 'success',
        title: "Category successfully created.",
      });
    },
  });
  const initialValues: FormikState = {
    title: '',
    titleTranslations: {},
    thumbnail: '',
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createCategorySchema,
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
      ...values, titleTranslations:translations?.titleTranslations
    };
    mutate(payload);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Category
          </Button>
        }
        title="Create Category"
        submitButton={
          <Button form="create-category" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="create-category" onSubmit={formik.handleSubmit}>
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
