import { useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/outline';
import { Button } from '@/components/Elements';
import { FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { createExercise } from '../api';
import { useMutation, useQuery } from 'react-query';
import { queryClient } from '@/lib/react-query';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { Select } from '@/components/Form';
import { createExerciseSchema } from '@/utils/yup';
import { createCategory } from '@/features/categories/api';
import { createTag } from '@/features/tags/api';

import { useLanguageStore } from '@/stores/languages';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslatableTextareaWithFormatting } from '@/components/Form/TranslatableTextareaWithFormatting';
import { TranslatableDropzone } from '@/components/Form/TranslatableDropzone';
import { prepareTranslations } from '@/utils/translationHelper';
interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  vimeoId: string;
  vimeoIdTranslations: Record<string, string>;
  categories: string[];
  tags: string[];
  guide: string;
  usedEquipments: string[];
  relatedExercises: string[];
  thumbnail: string;
  thumbnailTranslations: Record<string, any>;
  videoThumbnail: any;
  videoThumbnailTranslations: Record<string, any>;
  deleteThumbnail: boolean;
  deletevideoThumbnail: boolean;
}

export const CreateExercise = ({ exerciseTitles, equipmentTitles, categoryTitles, tagTitles, onCategoryCreate, onTagCreate }) => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const {
    selectedLanguages,
    handleLanguageToggle,
    resetLanguages,
    getFilteredTranslations,
  } = useTranslations({
    translationFields: ['title', 'description', 'thumbnail', 'videoThumbnail','vimeoId'],
  });

  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);

  const { mutate, isLoading, isSuccess } = useMutation(createExercise, {
    onSuccess: (msg:any) => {
      formik.resetForm();
      resetLanguages();
      queryClient.invalidateQueries('get-exercises');
      addNotification({
        type: 'success',
        title: msg
      });
    }
  });

  const initialValues: FormikState = {
    title: '',
    titleTranslations: {},
    description: '',
    descriptionTranslations: {},
    vimeoId: '',
    vimeoIdTranslations: {},
    categories: [],
    tags: [],
    guide: '',
    usedEquipments: [],
    relatedExercises: [],
    thumbnail: '',
    thumbnailTranslations: {},
    videoThumbnail: '',
    videoThumbnailTranslations: {},
    deleteThumbnail: false,
    deletevideoThumbnail: false,
  };
  
  const formik = useFormik({
    initialValues,
    validationSchema: createExerciseSchema,
    onSubmit: (values) => onSubmit(values)
  });

  const onSubmit = (values: any) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title', 'description','vimeoId'],
      imageFields: ['thumbnail', 'videoThumbnail'],
    });
    const payload = {
      ...values, ...translations
    }
    mutate(payload);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button variant="danger" size="sm" startIcon={<PlusIcon className="h-4 w-4" />}>
            &nbsp;&nbsp;Create Exercise
          </Button>
        }
        title="Create Exercise"
        submitButton={
          <Button form="create-exercise" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="create-exercise" onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="row">
            <TranslatableInput
              formik={formik}
              name="title"
              translationField="titleTranslations"
              label="Title"
              selectedLanguages={selectedLanguages}
            />
          </div>

          <div className="row">
            <TranslatableDropzone
              formik={formik}
              name="thumbnail"
              translationField="thumbnailTranslations"
              label="Thumbnail"
              selectedLanguages={selectedLanguages}
            />
          </div>

          <div className="row">
            <TranslatableDropzone
              formik={formik}
              name="videoThumbnail"
              translationField="videoThumbnailTranslations"
              label="Video Thumbnail"
              selectedLanguages={selectedLanguages}
            />
          </div>

          <div className="row">
            <Select
              isMulti
              formik={formik}
              label="Categories"
              name="categories"
              options={categoryTitles?.map(({ title, id }) => ({ label: title, value: id })) || []}
              value={formik.values.categories.map((id) => {
                const category = categoryTitles?.find((c) => c._id === id);
                return { label: category?.title || '', value: id };
              })}
              onChange={(value: any) =>
                formik.setFieldValue(
                  'categories',
                  value.map((v: any) => v.value)
                )
              }
              isCreatable
              onCreateOption={async (category: string) => {
                const data = await createCategory({ title: category });
                formik.setFieldValue(
                  'categories',
                  [...formik.values.categories, data.id]
                )
                onCategoryCreate();
              }}
            />
          </div>

          <div className="row">
            <Select
              isMulti
              formik={formik}
              label="Tags"
              name="tags"
              options={tagTitles?.map(({ title, id }) => ({ label: title, value: id })) || []}
              value={formik.values.tags.map((id) => {
                const tag = tagTitles?.find((c) => c._id === id);
                return { label: tag?.title || '', value: id };
              })}
              onChange={(value: any) =>
                formik.setFieldValue(
                  'tags',
                  value.map((v: any) => v.value)
                )
              }
              isCreatable
              onCreateOption={async (tag: string) => {
                const data = await createTag({ title: tag });
                formik.setFieldValue(
                  'tags',
                  [...formik.values.tags, data.id]
                )
                onTagCreate();
              }}
            />
          </div>

          <div className="row">
            <TranslatableInput
              formik={formik}
              name="vimeoId"
              translationField="vimeoIdTranslations"
              label="Vimeo Id"
              selectedLanguages={selectedLanguages}
            />
          </div>

          <div className="row">
            <TranslatableTextareaWithFormatting
              formik={formik}
              name="description"
              label="Description"
              selectedLanguages={selectedLanguages}
              placeholder="Enter description"
            />
          </div>

          <div className="row">
            <Select
              isMulti
              formik={formik}
              label="Equipment used"
              name="usedEquipments"
              options={equipmentTitles?.map(({ title, id }) => ({ label: title, value: id })) || []}
              value={formik.values.usedEquipments.map((id) => {
                const equipment = equipmentTitles?.find((e) => e._id === id);
                return { label: equipment?.title || '', value: id };
              })}
              onChange={(value: any) =>
                formik.setFieldValue(
                  'usedEquipments',
                  value.map((v: any) => v.value)
                )
              }
            />
          </div>

          <div className="row">
            <Select
              isMulti
              formik={formik}
              label="Related Exercises"
              name="relatedExercises"
              options={exerciseTitles?.map(({ title, id }) => ({ label: title, value: id })) || []}
              value={formik.values.relatedExercises.map((id) => {
                const exercise = exerciseTitles?.find((e) => e._id === id);
                return { label: exercise?.title || '', value: id };
              })}
              onChange={(value: any) =>
                formik.setFieldValue(
                  'relatedExercises',
                  value.map((v: any) => v.value)
                )
              }
            />
          </div>
        </form>
      </FormDrawer>
    </Authorization>
  );
};
