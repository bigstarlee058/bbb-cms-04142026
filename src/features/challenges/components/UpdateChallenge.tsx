import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import { updateChallenge } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createChallengeSchema } from '@/utils/yup';

interface FormikState {
  title: string;
  description: string;
  image?: any;
  deleteImage: boolean;
}

export const UpdateChallenge = ({ challengeId, challenges }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateChallenge, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const challengeData = challenges.challenges.find((ex) => ex._id === challengeId);

  const initialValues: FormikState = {
    title: challengeData?.title || '',
    description: challengeData?.description || '',
    image: challengeData?.photo || '',
    deleteImage: false
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createChallengeSchema,
    onSubmit: (v) => onSubmit(v)
  });
  const onSubmit = (state: FormikState) => {
    const { title, image, description, deleteImage } = state;
    mutate({ challengeId, title, image, description, deleteImage });
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Challenge"
        submitButton={
          <Button form="update-challenge" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-challenge" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Textarea label="Description" formik={formik} name="description" />
          <Dropzone
            label="Photo"
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
