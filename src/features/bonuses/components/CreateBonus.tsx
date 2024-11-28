import { useFormik } from 'formik';
import { useMutation } from 'react-query';
import { PlusIcon } from '@heroicons/react/outline';
import { useNotificationStore } from '@/stores/notifications';
import { createBonusSchema } from '@/utils/yup';
import { Authorization, ROLES } from '@/lib/authorization';
import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone, Textarea} from '@/components/Form';
import {  } from '@/components/Form';
import { createBonus } from '../api';

interface FormikState {
  title: string;
  description: string;
  image: any;
  deleteImage: boolean;
  isFeatured: boolean;
}

export const CreateBonus = () => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createBonus, {
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
    description: '',
    image: '',
    deleteImage: false,
    isFeatured: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createBonusSchema,
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
            Create Bonus
          </Button>
        }
        title="Create Bonus"
        submitButton={
          <Button form="create-bonus" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-bonus" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Textarea label="Description" formik={formik} name="description" />
          <Dropzone
            label="Thumbnail"
            name="image"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
          <Field type="checkbox" label="Featured" formik={formik} name="isFeatured" style={{maxWidth: "20px"}} />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
