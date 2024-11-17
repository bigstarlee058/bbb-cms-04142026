import { PencilIcon } from '@heroicons/react/solid';

import { Button } from '@/components/Elements';
import { FormDrawer, Field } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery } from 'react-query';
import { fetchUser, updateUser } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createUserSchema } from '@/utils/yup';

type UpdateUserProps = {
  userId: string;
};

interface FormikState {
  name: string;
}

export const UpdateUser = ({ userId }: UpdateUserProps) => {
  const { addNotification } = useNotificationStore();
  const { data, refetch } = useQuery('get-category', () => fetchUser(userId));
  console.log(data);
  const { mutate, isLoading, isSuccess } = useMutation(updateUser, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const initialValues: FormikState = {
    name: data?.name || '',
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createUserSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (value: any) => {
    mutate({ userId, payload: value });
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button startIcon={<PencilIcon className="h-4 w-4" />} size="sm">
            Update User
          </Button>
        }
        title="Update User"
        submitButton={
          <Button form="update-user" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-user" onSubmit={formik.handleSubmit}>
          <Field label="name" formik={formik} name="name" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
