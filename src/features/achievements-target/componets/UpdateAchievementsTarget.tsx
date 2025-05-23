import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import { updateTarget } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createTagSchema } from '@/utils/yup';

interface FormikState {
  title: string;
}

export const UpdateAchievementsTarget = ({ targetId, targets }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateTarget, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const targetData = targets.achievementsTargets.find(ex => ex._id === targetId);

  const initialValues: FormikState = {
    title: targetData?.title || '',
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createTagSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (state: FormikState) => {
    const { title, } = state;
    mutate({ targetId, title});
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Target"
        submitButton={
          <Button form="update-target" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-target" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
