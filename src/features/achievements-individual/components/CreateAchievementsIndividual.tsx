import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';

import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createCategorySchema } from '@/utils/yup';

import { createAchievement } from '../api';

interface FormikState {
  title: string;
  deleteImage: boolean;
  image: any;
  type: string;
  value: string;
  description: string;
}

export const CreateAchievementsIndividual = () => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createAchievement, {
    onSuccess: () => {
      formik.resetForm();
      addNotification({
        type: 'success',
        title: "Achievement successfully created.",
      });
    },
  });
  const initialValues: FormikState = {
    title: '',
    image: '',
    deleteImage: false,
    type: 'Week',
    value: '1',
    description: '',
  };
  const typeValue = ["Week", "Lift"];
  const formik = useFormik({
    initialValues,
    validationSchema: createCategorySchema,
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
            Create Achievement
          </Button>
        }
        title="Create Achievement"
        submitButton={
          <Button form="create-achievement" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-achievement" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Dropzone
            label="Thumbnail"
            name="image"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
          <Select
            formik={formik}
            label="Type"
            name="type"
            options={typeValue?.map((value) => ({ label: value, value: value })) || []}
            value= {{ label: formik.values.type, value: formik.values.type }}
            onChange={(value: any) =>formik.setFieldValue('type', value.value)}
          />
          <Field label="Value" formik={formik} name="value" type ='number'/>
          <Textarea label="Description" formik={formik} name="description" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
