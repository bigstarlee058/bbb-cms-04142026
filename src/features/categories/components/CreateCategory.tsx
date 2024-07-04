import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';

import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createCategorySchema } from '@/utils/yup';

import { createCategory } from '../api';

interface FormikState {
  title: string;
  deleteImage: boolean;
  image: any;
}

export const CreateCategory = () => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createCategory, {
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
    image: '',
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createCategorySchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (value: { title: string; image: File }) => {
    mutate(value);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Category
          </Button>
        }
        title="Create Category"
        submitButton={
          <Button form="create-category" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-category" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
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
