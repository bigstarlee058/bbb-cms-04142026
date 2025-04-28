import { PencilIcon, PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';

import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { updateVersionSchema } from '@/utils/yup';
import { updateVersion } from './api';
import { Textarea } from '@/components/Form';

interface FormikState {
    version: string;
  description: string;
}

export const UpdateVersion = ({screenData}) => {
  const { addNotification } = useNotificationStore();

  const initialValues: FormikState = {
    version: screenData?.latest_version || '1.0',
    description: screenData?.update_message || '',
  };
 const formik = useFormik({
    initialValues,
    validationSchema: updateVersionSchema,
    onSubmit: (v) => onSubmit(v)
  });

  const { mutate, isLoading, isSuccess } = useMutation(updateVersion, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const onSubmit = (state: FormikState) => {
    const { version, description } = state;
    mutate({ version, description });
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PencilIcon className="h-4 w-4" />}>
            &nbsp;Update Version
          </Button>
        }
        title="Update Version Detail"
        submitButton={
          <Button form="update-screens" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-screens" onSubmit={formik.handleSubmit}>
          <Field label="New Version" formik={formik} name="version" />
          <Textarea label="Description" formik={formik} name="description" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
