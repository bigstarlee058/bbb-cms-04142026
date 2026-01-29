import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import {  Select, FormDrawer,} from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery ,useQueryClient} from 'react-query';
import { updateExercise } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createExerciseSchema } from '@/utils/yup';
import { TitleResponse, Exercise } from '@/types';
import { createCategory } from '@/features/categories/api';
import { createTag } from '@/features/tags/api';
import { useState, useEffect } from 'react';
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
  deleteVideoThumbnail: boolean;
}

export const UpdateExercise = ({
  exerciseId,
  exercises,
  exTitles,
  eqTitles,
  caTitles,
  tagTitles,
  onCategoryCreate,
  onTagCreate
}: {
  exerciseId: string;
  exercises: { exercises: Exercise[] };
  exTitles: TitleResponse[];
  eqTitles: TitleResponse[];
  caTitles: TitleResponse[];
  tagTitles: TitleResponse[];
  onCategoryCreate: () => void;
  onTagCreate: () => void;
}) => {
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
    translationFields: ['title', 'description', 'thumbnail', 'videoThumbnail', 'vimeoId'],
  });

  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);
  const exerciseData = exercises.exercises.find((ex) => ex._id === exerciseId);
  useEffect(() => {
    if (!exercises) return;
    const apiLanguages = useLanguageStore.getState().languages.map(l => l.key);

    const langs = Object.values(exerciseData || {})
      .flatMap(obj => obj && typeof obj === 'object' ? Object.keys(obj) : [])
      .filter(key => apiLanguages.includes(key));

    setSelectedLanguages([...new Set(langs)]);
  }, [exerciseData, setSelectedLanguages]);
  const { mutate, isLoading, isSuccess } = useMutation(updateExercise, {
    onSuccess: (message: string) => {
      queryClient.invalidateQueries('get-exercises');
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  
  const exerciseTitles = exTitles && exTitles.filter((title) => title.id !== exerciseId);
  const equipmentTitles = eqTitles;

  const [categoryTitles, setCategoryTitles] = useState(caTitles)
  const [taTitles, setTaTitles] = useState(tagTitles)

  const initialValues: FormikState = {
    title: exerciseData?.title || '',
    titleTranslations: exerciseData?.titleTranslations || {},
    description: exerciseData?.description || '',
    descriptionTranslations: exerciseData?.descriptionTranslations || {},
    vimeoId: exerciseData?.vimeoId || '',
    vimeoIdTranslations: exerciseData?.vimeoIdTranslations || {},
    categories: exerciseData?.categories || [],
    tags: exerciseData?.tags || [],
    guide: exerciseData?.guide || '',
    usedEquipments: exerciseData?.usedEquipments || [],
    relatedExercises: exerciseData?.relatedExercises || [],
    thumbnail: exerciseData?.thumbnail || '',
    thumbnailTranslations: exerciseData?.thumbnailTranslations || {},
    videoThumbnail: exerciseData?.videoThumbnail || '',
    videoThumbnailTranslations: exerciseData?.videoThumbnailTranslations || {},
    deleteThumbnail: false,
    deleteVideoThumbnail: false
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createExerciseSchema,
    onSubmit: (v) => onSubmit(v)
  });
  const onSubmit = (values: any) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title', 'description', 'vimeoId'],
      imageFields: [ 'thumbnail', 'videoThumbnail'],
    });
    const payload = {
      ...values,
      ...translations,
      deleteImage: values.deleteImage || false,
      deleteImageTranslations: values.deleteImageTranslations || [],
    };

    mutate({ exerciseId, payload });
    onCategoryCreate();
    onTagCreate();
    queryClient.invalidateQueries(['get-exercise', exerciseId]);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Exercise"
        submitButton={
          <Button form="update-exercise" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="update-exercise" onSubmit={formik.handleSubmit}>
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
          <Select
            isMulti
            formik={formik}
            label="Categories"
            name="categories"
            options={categoryTitles?.map(({ title, id }) => ({ label: title, value: id })) || []}
            value={formik.values.categories.map((id) => {
              const category = categoryTitles?.find((c) => c.id === id);
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
              formik.setFieldValue('categories', [...formik.values.categories, data.id]);
              setCategoryTitles((prev) => ([...prev, { title: category, id: data.id }]))
            }}
          />
          <Select
            isMulti
            formik={formik}
            label="Tags"
            name="tags"
            options={taTitles?.map(({ title, id }) => ({ label: title, value: id })) || []}
            value={formik.values.tags.map((id) => {
              const tag = taTitles?.find((c) => c.id === id);
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
              formik.setFieldValue('tags', [...formik.values.tags, data.id]);
              setTaTitles((prev) => ([...prev, { title: tag, id: data.id }]))
            }}
          />
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
          <Select
            isMulti
            formik={formik}
            label="Equipment used"
            name="usedEquipments"
            options={equipmentTitles?.map(({ title, id }) => ({ label: title, value: id })) || []}
            value={formik.values.usedEquipments.map((id) => {
              const equipment = equipmentTitles?.find((e) => e.id === id);
              return { label: equipment?.title || '', value: id };
            })}
            onChange={(value: any) =>
              formik.setFieldValue(
                'usedEquipments',
                value.map((v: any) => v.value)
              )
            }
          />
          <Select
            isMulti
            formik={formik}
            label="Related Exercises"
            name="relatedExercises"
            options={exerciseTitles?.map(({ title, id }) => ({ label: title, value: id })) || []}
            value={formik.values.relatedExercises.map((id) => {
              const exercise = exerciseTitles?.find((exercise) => exercise.id === id);
              return { label: exercise?.title || '', value: id };
            })}
            onChange={(value: any) =>
              formik.setFieldValue(
                'relatedExercises',
                value.map((v: any) => v.value)
              )
            }
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
