import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';

import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createTagsSchema } from '@/utils/yup';

import { createTag } from '../api';

interface FormikState {
  title: string;
  deleteImage: boolean;
  image: any;
}

export const CreateTag = () => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createTag, {
    onSuccess: () => {
      formik.resetForm();
      addNotification({
        type: 'success',
        title: "Tag successfully created.",
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
    validationSchema: createTagsSchema,
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
            Create Tag
          </Button>
        }
        title="Create Tag"
        submitButton={
          <Button form="create-tag" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-tag" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
