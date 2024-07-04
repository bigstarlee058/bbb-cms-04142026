import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { FormDrawer, Field } from '@/components/Form';
import { useAuth } from '@/lib/auth';
import { updateUser } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useMutation } from 'react-query';
import { useFormik } from 'formik';
import { createUserSchema } from '@/utils/yup';

interface FormikState {
  firstname: string;
  lastname: string;
}

export const UpdateProfile = () => {
  const { user } = useAuth();
  const { addNotification } = useNotificationStore();

  const { mutate, isSuccess, isLoading } = useMutation(updateUser, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const initialValues: FormikState = {
    firstname: user?.displayName || '',
    lastname: user?.displayName || '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: createUserSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (value: any) => {
    mutate(value);
  };
  return (
    <FormDrawer
      isDone={isSuccess}
      triggerButton={
        <Button startIcon={<PencilIcon className="h-4 w-4" />} size="sm">
          Update Profile
        </Button>
      }
      title="Update Profile"
      submitButton={
        <Button form="update-profile" type="submit" size="sm" isLoading={isLoading}>
          Submit
        </Button>
      }
    >
      <form id="update-profile" onSubmit={formik.handleSubmit}>
        <Field label="First Name" formik={formik} name="firstname" />
        <Field label="Last Name" formik={formik} name="lastname" />
      </form>
    </FormDrawer>
  );
};
