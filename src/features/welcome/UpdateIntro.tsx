import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { FormDrawer, Field } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery } from 'react-query';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createVimeoSchema } from '@/utils/yup';
import { fetchIntro, updateIntro } from './api';

interface FormikState {
  vimeoId: string;
}

export const UpdateIntro = () => {
  const { addNotification } = useNotificationStore();
  const { data, refetch } = useQuery('get-intro', () => fetchIntro());
  const { mutate, isLoading, isSuccess } = useMutation(updateIntro, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const initialValues: FormikState = {
    vimeoId: data?.vimeoId || '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: createVimeoSchema,
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
          <Button startIcon={<PencilIcon className="h-4 w-4" />} size="sm">
            Update Video
          </Button>
        }
        title="Update Intro Video"
        submitButton={
          <Button form="update-intro" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-intro" onSubmit={formik.handleSubmit}>
          <Field label="Vimeo ID" formik={formik} name="vimeoId" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
