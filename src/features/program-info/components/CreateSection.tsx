import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';

import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createSectionSchema } from '@/utils/yup';

import { createSection } from '../api';
import { TextareaWithFormatting } from '@/components/Form/TextareaWithFormatting';

interface FormikState {
  title: string;
  description: string;
  vimeoId: string;
}

export const CreateSection = () => {
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
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createSectionSchema,
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
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4 mr-1" />}>
            Create Section
          </Button>
        }
        title="Create Section"
        submitButton={
          <Button form="create-section" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-section" onSubmit={formik.handleSubmit}>
          <Field label="Name" formik={formik} name="title" />
          {/* <Textarea label="Description" formik={formik} name="description" /> */}
          <TextareaWithFormatting label="Description" formik={formik} name="description" />
          <Field label="vimeoId" formik={formik} name="vimeoId" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
