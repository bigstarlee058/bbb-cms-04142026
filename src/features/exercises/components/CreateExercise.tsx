import { PlusIcon } from '@heroicons/react/outline';
import { Button } from '@/components/Elements';
import { FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { createExercise } from '../api';
import { useMutation, useQuery } from 'react-query';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { Field, Dropzone } from '@/components/Form';
import { createExerciseSchema } from '@/utils/yup';
import { Textarea, Select } from '@/components/Form';
import { fetchCategories } from '@/features/categories/api';
import { fetchAllCollections } from '@/features/collections/api';
import { fetchEquipments } from '@/features/equipment/api';

interface FormikState {
  title: string;
  description: string;
  vimeoId: string;
  deleteImage: boolean;
  image: any;
}

export const CreateExercise = () => {
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

  const initialValues: FormikState = {
    title: '',
    description: '',
    vimeoId: '',
    image: '',
    deleteImage: false,
  };



  const formik = useFormik({
    initialValues,
    validationSchema: createExerciseSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (value: any) => {
    mutate(value);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Exercise
          </Button>
        }
        title="Create Exercise"
        submitButton={
          <Button form="create-exercise" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-exercise" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Textarea label="Description" formik={formik} name="description" />
          <Field label="Vimeo" formik={formik} name="vimeoId" />
          <Dropzone
            label="Thumbnail"
            name="image"
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
