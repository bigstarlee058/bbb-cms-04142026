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

interface FormikState {
  title: string;
  description: string;
  vimeoId: string;
  categories: string[];
  guide: string;
  relatedExercises: string[];
  image: any;
  deleteImage: boolean;
}

export const CreateExercise = ({titles}) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createExercise, {
    onSuccess: (message: string) => {
      formik.resetForm();
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const exerciseTitles = titles || [];
  
  const initialValues: FormikState = {
    title: '',
    description: '',
    vimeoId: '',
    categories: [],
    guide: '',
    relatedExercises: [],
    image: '',
    deleteImage: false,
  };

  const formik = useFormik({
    initialValues,
    validationSchema: createExerciseSchema,
    onSubmit: (values) => onSubmit(values),
  });

  const onSubmit = (values: any) => {
    mutate(values);
  };

  const categoryOptions = [
    { label: 'Upper Chest', value: 'upperchest' },
    { label: 'Leg', value: 'leg' },
    { label: 'Back', value: 'back' },
    // Add more categories as needed
  ];

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button variant='danger' size="sm" startIcon={<PlusIcon className="h-4 w-4" />}>
            &nbsp;&nbsp;Create Exercise
          </Button>
        }
        title="Create Exercise"
        submitButton={
          <Button
            form="create-exercise"
            variant="danger"
            type="submit"
            size="sm"
            isLoading={isLoading}
          >
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
            label="Categories"
            formik={formik}
            name="categories"
            options={categoryOptions}
            onChange={(value: any) => formik.setFieldValue('categories', value.map((v: any) => v.value))}
          />
          {/* <Field label="Categories" formik={formik} name="categories" /> */}
          <Field label="Vimeo" formik={formik} name="vimeoId" />
          <Textarea label="Description" formik={formik} name="description" />
          {/* <Textarea label="Guide" formik={formik} name="guide" /> */}
          <Select
            isMulti
            formik={formik}
            label="Related Exercises"
            name="relatedExercises"
            options={exerciseTitles?.map(({ title, id }) => ({ label: title, value: id })) || []}
            value={formik.values.relatedExercises.map((id) => {
              const exercise = exerciseTitles?.find((exercise) => exercise._id === id);
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
