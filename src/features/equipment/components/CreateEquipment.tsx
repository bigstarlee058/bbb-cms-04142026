import { useFormik } from 'formik';
import { useMutation } from 'react-query';
import { PlusIcon } from '@heroicons/react/outline';
import { useNotificationStore } from '@/stores/notifications';
import { createEquipmentSchema } from '@/utils/yup';
import { Authorization, ROLES } from '@/lib/authorization';
import { Button } from '@/components/Elements';
import { FormDrawer } from '@/components/Form';
import { Field, Dropzone } from '@/components/Form';
import { createEquipment } from '../api';

interface FormikState {
  title: string;
  price: number;
  link: string;
  image: any;
  deleteImage: boolean;
}

export const CreateEquipment = () => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createEquipment, {
    onSuccess: (message: string) => {
      formik.resetForm();
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const initialValues: FormikState = {
    title: '',
    price: 0,
    link: '',
    image: '',
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createEquipmentSchema,
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
          <Button size="sm" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Equipment
          </Button>
        }
        title="Create Equipment"
        submitButton={
          <Button form="create-equipment" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-equipment" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Field label="Price" formik={formik} name="price" />
          <Field label="Link" formik={formik} name="link" />
          <Dropzone
            label="Thumbnail"
            name="image"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
