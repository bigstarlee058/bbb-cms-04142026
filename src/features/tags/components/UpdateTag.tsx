import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import { updateTag } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createTagsSchema } from '@/utils/yup';

interface FormikState {
  title: string;
  image?: any;
  deleteImage: boolean;
}

export const UpdateTag = ({ tagId, tags }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateTag, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const tagData = tags.tags.find(ex => ex._id === tagId);

  const initialValues: FormikState = {
    title: tagData?.title || '',
    image: tagData?.thumbnail || '',
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createTagsSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (state: FormikState) => {
    const { title, image, deleteImage } = state;
    mutate({ tagId, title, image, deleteImage });
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Tag"
        submitButton={
          <Button form="update-tag" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-tag" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
