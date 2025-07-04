import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, Textarea, Select, FormDrawer, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import { updateExercise } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createExerciseSchema } from '@/utils/yup';
import { TitleResponse, Exercise } from '@/types';
import { createCategory } from '@/features/categories/api';
import { createTag } from '@/features/tags/api';
import { useState } from 'react';
import { TextareaWithFormatting } from '@/components/Form/TextareaWithFormatting';

interface FormikState {
  title: string;
  description: string;
  vimeoId: string;
  categories: string[];
  tags: string[];
  guide: string;
  usedEquipments: string[];
  relatedExercises: string[];
  image: any;
  videoImage: any;
  deleteImage: boolean;
  deleteVideoImage: boolean;
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
  const { mutate, isLoading, isSuccess } = useMutation(updateExercise, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const exerciseData = exercises.exercises.find((ex) => ex._id === exerciseId);
  const exerciseTitles = exTitles && exTitles.filter((title) => title.id !== exerciseId);
  const equipmentTitles = eqTitles;

  const [categoryTitles, setCategoryTitles] = useState(caTitles)
  const [taTitles, setTaTitles] = useState(tagTitles)

  const initialValues: FormikState = {
    title: exerciseData?.title || '',
    description: exerciseData?.description || '',
    vimeoId: exerciseData?.vimeoId || '',
    categories: exerciseData?.categories || [],
    tags: exerciseData?.tags || [],
    guide: exerciseData?.guide || '',
    usedEquipments: exerciseData?.usedEquipments || [],
    relatedExercises: exerciseData?.relatedExercises || [],
    image: exerciseData?.thumbnail,
    videoImage: exerciseData?.videoThumbnail,
    deleteImage: false,
    deleteVideoImage: false
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createExerciseSchema,
    onSubmit: (v) => onSubmit(v)
  });
  const onSubmit = (value: any) => {
    mutate({ exerciseId, payload: value });
    onCategoryCreate();
    onTagCreate();
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
        <form id="update-exercise" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Dropzone
            label="Thumbnail"
            name="image"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
          <Dropzone
            label="Video Thumbnail"
            name="videoImage"
            formik={formik}
            defaultImg={formik.values.videoImage}
            onDrop={(img) => formik.setFieldValue('videoImage', img)}
            onDelete={() => formik.setValues({ ...formik.values, videoImage: '', deleteVideoImage: true })}
          />
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
              setCategoryTitles((prev) => ([...prev, {title: category, id: data.id}]))
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
              setTaTitles((prev) => ([...prev, {title: tag, id: data.id}]))
            }}
          />
          <Field label="Vimeo" formik={formik} name="vimeoId" />
          {/* <Textarea label="Description" formik={formik} name="description" /> */}
          <TextareaWithFormatting label="Description" formik={formik} name="description" />
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
