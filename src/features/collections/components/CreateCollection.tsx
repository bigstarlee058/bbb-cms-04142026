import { useFormik } from 'formik';
import { useMutation } from 'react-query';
import { PlusIcon } from '@heroicons/react/outline';
import { useNotificationStore } from '@/stores/notifications';
import { createCollectionSchema } from '@/utils/yup';
import { Authorization, ROLES } from '@/lib/authorization';
import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone, Textarea} from '@/components/Form';
import {  } from '@/components/Form';
import { createCollection } from '../api';

interface FormikState {
  title: string;
  description: string;
  image: any;
  deleteImage: boolean;
  isFeatured: boolean;
}

export const CreateCollection = () => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createCollection, {
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
    validationSchema: createCollectionSchema,
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
            Create Collection
          </Button>
        }
        title="Create Collection"
        submitButton={
          <Button form="create-collection" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-collection" onSubmit={formik.handleSubmit}>
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
