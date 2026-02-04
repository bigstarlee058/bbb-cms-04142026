import { useEffect } from 'react';
import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import {  FormDrawer, Dropzone, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { updateEquipment } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createEquipmentSchema } from '@/utils/yup';
import { TranslatableTextareaWithFormatting } from '@/components/Form/TranslatableTextareaWithFormatting';
import { useLanguageStore } from '@/stores/languages';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { useTranslations } from '@/hooks/useTranslations';
import { prepareTranslations } from '@/utils/translationHelper';

interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  link: string;
  linkTranslations: Record<string, string>;
  thumbnail?: any;
  deleteImage: boolean;
  collections: string[],
}

export const UpdateEquipment = ({ equipmentId, equipments, titles }) => {
  const { addNotification } = useNotificationStore();
  const queryClient = useQueryClient();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const {
    selectedLanguages,
    handleLanguageToggle,
    resetLanguages,
    getFilteredTranslations,
    setSelectedLanguages,
  } = useTranslations({
    translationFields: ['title', 'description', 'link']
  })
  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);
  const { mutate, isLoading, isSuccess } = useMutation(updateEquipment, {
    onSuccess: (message: string) => {
      queryClient.invalidateQueries('get-equipment');
      resetLanguages();
      formik.resetForm();
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const equipmentData = equipments.equipments.find(eq => eq._id === equipmentId);
  const collectionTitles = titles || [];
  useEffect(() => {
    if (!equipments) return;
    const apiLanguages = useLanguageStore.getState().languages.map(l => l.key);

    const langs = Object.values(equipmentData || {})
      .flatMap(obj => obj && typeof obj === 'object' ? Object.keys(obj) : [])
      .filter(key => apiLanguages.includes(key));

    setSelectedLanguages([...new Set(langs)]);
  }, [equipmentData, setSelectedLanguages]);
  const initialValues: FormikState = {
    title: equipmentData?.title || '',
    titleTranslations: equipmentData?.titleTranslations || {},
    description: equipmentData?.description || '',
    descriptionTranslations: equipmentData?.descriptionTranslations || {},
    link: equipmentData?.link || '',
    linkTranslations: equipmentData?.linkTranslations || {},
    thumbnail: equipmentData?.thumbnail || '',
    deleteImage: false,
    collections: equipmentData?.collections || [],
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createEquipmentSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (values: FormikState) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title', 'description', 'link'],
      imageFields: [],
    });
    const payload = {
      ...values, ...translations
    }
    mutate({ equipmentId, payload });
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Equipment"
        submitButton={
          <Button form="update-equipment" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="update-equipment" onSubmit={formik.handleSubmit}>
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
            name="thumbnail"
            formik={formik}
            defaultImg={formik.values.thumbnail}
            onDrop={(img) => formik.setFieldValue('thumbnail', img)}
            onDelete={() => formik.setValues({ ...formik.values, thumbnail: '', deleteImage: true })}
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
