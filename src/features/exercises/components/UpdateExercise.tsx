import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, Textarea, Select, FormDrawer, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery } from 'react-query';
import { fetchExercise, updateExercise } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createExerciseSchema } from '@/utils/yup';

type UpdateExerciseProps = {
  exerciseId: string;
};
interface FormikState {
  title: string;
  description: string;
  vimeoId: string;
  deleteImage: boolean;
  image: any;
}

export const UpdateExercise = ({ exerciseId }: UpdateExerciseProps) => {
  const { addNotification } = useNotificationStore();
  const { data, refetch } = useQuery('get-exercise', () => fetchExercise(exerciseId));
  const { mutate, isLoading, isSuccess } = useMutation(updateExercise, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });



  const initialValues: FormikState = {
    title: data?.title || '',
    description: data?.description || '',
    vimeoId: data?.vimeoId || '',
    image: data?.thumbnail,
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createExerciseSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (value: any) => {
    mutate({ exerciseId, payload: value });
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button startIcon={<PencilIcon className="h-4 w-4" />} size="sm">
            Update Exercise
          </Button>
        }
        title="Update Exercise"
        submitButton={
          <Button form="update-exercise" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-exercise" onSubmit={formik.handleSubmit}>
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
