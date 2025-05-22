import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';

import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createTagSchema } from '@/utils/yup';

import { createTarget } from '../api';

interface FormikState {
  title: string;
}

export const CreateAchievementsTarget = () => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createTarget, {
    onSuccess: () => {
      formik.resetForm();
      addNotification({
        type: 'success',
        title: "Target successfully created.",
      });
    },
  });
  const initialValues: FormikState = {
    title: '',
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createTagSchema,
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
            Create Target
          </Button>
        }
        title="Create Target"
        submitButton={
          <Button form="create-target" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-target" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
