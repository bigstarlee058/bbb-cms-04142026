import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';

import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createSectionSchema } from '@/utils/yup';

import { createSection } from '../api';

interface FormikState {
  title: string;
  description: string;
  vimeoId: string;
  image: any; 
  deleteImage: boolean;
}

export const EditMainInfo = () => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createSection, {
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
    description:'',
    vimeoId: '',
    image: '',
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createSectionSchema,
    onSubmit: (v) => onSubmit(v)
  });
  const onSubmit = (value: any) => {
    console.log("submit", value)
    mutate(value);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Edit Main Info
          </Button>
        }
        title="Edit Main Info"
        submitButton={
          <Button form="create-section" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-section" onSubmit={formik.handleSubmit}>
          <Field label="Main Title" formik={formik} name="title" />
          <Dropzone
            label="Thumbnail"
            name="image"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
          <Field label="Content Title" formik={formik} name="title" />
          <Textarea label="Content Description" formik={formik} name="description" />
          <Field label="vimeoId" formik={formik} name="vimeoId" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
