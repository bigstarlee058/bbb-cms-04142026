import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Textarea } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import {  updateCollection } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createCollectionSchema } from '@/utils/yup';

interface FormikState {
  title: string;
  description: string;
  image?: any;
  deleteImage: boolean;
  isFeatured: false;
}

export const UpdateCollection = ({ collectionId, collections }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateCollection, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const collectionData = collections.collections.find(ex => ex._id === collectionId);

  const initialValues: FormikState = {
    title: collectionData?.title || '',
    description: collectionData?.description || '',
    image: collectionData?.thumbnail || '',
    deleteImage: false,
    isFeatured: collectionData?.isFeatured || false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createCollectionSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (state: FormikState) => {
    const { title, image, deleteImage, description, isFeatured } = state;
    mutate({ collectionId, title, description, image, deleteImage, isFeatured });
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Collection"
        submitButton={
          <Button form="update-collection" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-collection" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Textarea label="Description" formik={formik} name="description" />
          <Dropzone
            label="Thumbnail"
            name="thumbnail"
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
