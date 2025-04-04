import { PlusIcon } from '@heroicons/react/outline';
import { Button } from '@/components/Elements';
import { FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { createExercise } from '../api';
import { useMutation, useQuery } from 'react-query';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { Field, Dropzone, Textarea, Select } from '@/components/Form';
import { createExerciseSchema } from '@/utils/yup';
import { createCategory } from '@/features/categories/api';
import { createTag } from '@/features/tags/api';

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
  deleteImage: boolean;
}

export const CreateExercise = ({ exerciseTitles, equipmentTitles, categoryTitles, tagTitles, onCategoryCreate, onTagCreate }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createExercise, {
    onSuccess: (message: string) => {
      formik.resetForm();
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const initialValues: FormikState = {
    title: '',
    description: '',
    vimeoId: '',
    categories: [],
    tags: [],
    guide: '',
    usedEquipments: [],
    relatedExercises: [],
    image: '',
    deleteImage: false
  };

  const formik = useFormik({
    initialValues,
    validationSchema: createExerciseSchema,
    onSubmit: (values) => onSubmit(values)
  });

  const onSubmit = (values: any) => {
    mutate(values);
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
        <form id="create-exercise" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
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
          <Field label="Vimeo" formik={formik} name="vimeoId" />
          <Textarea label="Description" formik={formik} name="description" />
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
        </form>
      </FormDrawer>
    </Authorization>
  );
};
