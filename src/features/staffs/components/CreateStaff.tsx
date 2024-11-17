import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';

import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createStaffSchema } from '@/utils/yup';

import { createStaff } from '../api';
import { SelectOption } from '@/types';

interface FormikState {
  title: string;
  type: number;
  bio: string;
  deleteImage: boolean;
  image: any;
}

const COACH_TYPE_OPTIONS: SelectOption[] = [
  {
    label: 'Staff',
    value: '1'
  },
  {
    label: 'Athlete',
    value: '2'
  }
];

export const CreateStaff = () => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createStaff, {
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
    type: 0,
    bio: '',
    deleteImage: false
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createStaffSchema,
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
            Create Staff
          </Button>
        }
        title="Create Staff"
        submitButton={
          <Button form="create-staff" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-staff" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Textarea label="Bio" formik={formik} name="bio" />
          <Dropzone
            label="Photo"
            name="image"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
          <Select
            formik={formik}
            label="Coach Type"
            name="type"
            options={COACH_TYPE_OPTIONS}
            onChange={({ value }: SelectOption) => formik.setFieldValue('type', value)}
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
