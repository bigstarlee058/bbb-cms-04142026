import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';

import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone, Textarea } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createTutorialSchema } from '@/utils/yup';

import { createTutorial } from '../api';

interface FormikState {
  title: string;
  description: string;
  vimeoId: string;
  deleteImage: boolean;
  image: any;
}

export const CreateTutorial = () => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createTutorial, {
    onSuccess: () => {
      formik.resetForm();
      addNotification({
        type: 'success',
        title: "Tutorial successfully created.",
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
    validationSchema: createTutorialSchema,
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
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Tutorial
          </Button>
        }
        title="Create Tutorial"
        submitButton={
          <Button form="create-tutorial" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-tutorial" onSubmit={formik.handleSubmit}>
            <Field label="Title" formik={formik} name="title" />
            <Field label="VimeoId" formik={formik} name="vimeoId" />
            <Dropzone
                label="Thumbnail"
                name="image"
                formik={formik}
                defaultImg={formik.values.image}
                onDrop={(img) => formik.setFieldValue('image', img)}
                onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
            />
            <Textarea label="Description" formik={formik} name="description" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
