import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';

import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createChallengeSchema } from '@/utils/yup';

import { createChallenge } from '../api';

interface FormikState {
  title: string;
  description: string;
  link: string;
  buttonText: string;
  deleteImage: boolean;
  image: any;
  isFeatured: false;
  isHide: false;
}

export const CreateChallenge = () => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createChallenge, {
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
    image: '',
    description: '',
    link: '',
    buttonText: '',
    deleteImage: false,
    isFeatured: false,
    isHide: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createChallengeSchema,
    onSubmit: (v) => onSubmit(v)
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
            Create Challenge
          </Button>
        }
        title="Create Challenge"
        submitButton={
          <Button form="create-challenge" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-challenge" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Textarea label="Description" formik={formik} name="description" />
          <Field label="Link" formik={formik} name="link" />
          <Field label="Button Text" formik={formik} name="buttonText" />
          <Dropzone
            label="Photo"
            name="image"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
          <Field type="checkbox" label="Featured" formik={formik} name="isFeatured" style={{maxWidth: "20px"}} />
          <Field type="checkbox" label="Hide" formik={formik} name="isHide" style={{maxWidth: "20px"}} />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
