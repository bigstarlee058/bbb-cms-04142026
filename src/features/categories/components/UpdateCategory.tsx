import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery } from 'react-query';
import { fetchCategory, updateCategory } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createCategorySchema } from '@/utils/yup';

type UpdateCategoryProps = {
  categoryId: string;
};

interface FormikState {
  title: string;
  deleteImage: boolean;
  image: any;
}

export const UpdateCategory = ({ categoryId }: UpdateCategoryProps) => {
  const { addNotification } = useNotificationStore();
  const { data, refetch } = useQuery(['get-category', categoryId], () => fetchCategory(categoryId));
  const { mutate, isLoading, isSuccess } = useMutation(updateCategory, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const initialValues: FormikState = {
    title: data?.title || '',
    image: data?.thumbnail,
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createCategorySchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (state: any) => {
    mutate({ categoryId, payload: state });
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button startIcon={<PencilIcon className="h-4 w-4" />} size="sm">
            Update Category
          </Button>
        }
        title="Update Category"
        submitButton={
          <Button form="update-category" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-category" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
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
