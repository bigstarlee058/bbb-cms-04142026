import { useEffect } from 'react';
import { useFormik } from 'formik';
import { useMutation,useQuery } from 'react-query';
import { PlusIcon } from '@heroicons/react/outline';
import { useNotificationStore } from '@/stores/notifications';
import { createEquipmentSchema } from '@/utils/yup';
import { Authorization, ROLES } from '@/lib/authorization';
import { Button } from '@/components/Elements';
import { FormDrawer, Select } from '@/components/Form';
import {  Dropzone } from '@/components/Form';
import { createEquipment } from '../api';
import { queryClient } from '@/lib/react-query';
import { useLanguageStore } from '@/stores/languages';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslatableTextareaWithFormatting } from '@/components/Form/TranslatableTextareaWithFormatting';
import { prepareTranslations } from '@/utils/translationHelper';
interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  link: string;
  linkTranslations: Record<string, string>;
  image: any;
  deleteImage: boolean;
  collections: string[];
}

export const CreateEquipment = ({ titles }) => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const {
    selectedLanguages,
    handleLanguageToggle,
    getFilteredTranslations,
    resetLanguages,
  } = useTranslations({
    translationFields: ['title', 'description', 'link']
  });
  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);
  const { mutate, isLoading, isSuccess } = useMutation(createEquipment, {
    onSuccess: (message: string) => {
      formik.resetForm();
      resetLanguages();
      queryClient.invalidateQueries('get-equipment');
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const collectionTitles = titles || [];

  const initialValues: FormikState = {
    title: '',
    titleTranslations: {},
    description: '',
    descriptionTranslations: {},
    link: '',
    linkTranslations: {},
    image: '',
    deleteImage: false,
    collections: [],
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createEquipmentSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (values: any) => {
     const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title', 'description', 'link'],
      imageFields: [],
    });
        const payload = {
      ...values,
      ...translations,
    };
    mutate(payload);
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Equipment
          </Button>
        }
        title="Create Equipment"
        submitButton={
          <Button form="create-equipment" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="create-equipment" onSubmit={formik.handleSubmit}>
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
              name="link"
              translationField="linkTranslations"
              label="Link url"
              selectedLanguages={selectedLanguages}
            />
          <Dropzone
            label="Thumbnail"
            name="image"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
          <Select
            isMulti
            formik={formik}
            label="Related Collection"
            name="relatedCollections"
            options={collectionTitles?.map(({ title, id }) => ({ label: title, value: id })) || []}
            value={formik.values.collections.map((id) => {
              const exercise = collectionTitles?.find((exercise) => exercise._id === id);
              return { label: exercise?.title || '', value: id };
            })}
            onChange={(value: any) =>
              formik.setFieldValue(
                'collections',
                value.map((v: any) => v.value)
              )
            }
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
