import { PencilIcon, PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';
import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { updateScreensSchema } from '@/utils/yup';
import { updateScreens } from './api';
import { Textarea } from '@/components/Form';

interface FormikState {
  vimeo: string;
  image?: any;
  description: string;
  deleteImage: boolean;
}

export const UpdateScreens = ({screenData}) => {
  const { addNotification } = useNotificationStore();

  const initialValues: FormikState = {
    vimeo: screenData?.vimeoId || '',
    image: screenData?.imgUrl || '',
    deleteImage: false,
    description: screenData?.description || '',
  };
 const formik = useFormik({
    initialValues,
    validationSchema: updateScreensSchema,
    onSubmit: (v) => onSubmit(v)
  });

  const { mutate, isLoading, isSuccess } = useMutation(updateScreens, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const onSubmit = (state: FormikState) => {
    const { vimeo, image, deleteImage, description } = state;
    mutate({ vimeo, image, deleteImage, description });
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PencilIcon className="h-4 w-4" />}>
            &nbsp;Update Screens
          </Button>
        }
        title="Update Screens"
        submitButton={
          <Button form="update-screens" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-screens" onSubmit={formik.handleSubmit}>
          <Field label="Vimeo" formik={formik} name="vimeo" />
          <Textarea label="Description" formik={formik} name="description" />
          <Dropzone
            label="Thumbnail"
            name="thumbnail"
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
