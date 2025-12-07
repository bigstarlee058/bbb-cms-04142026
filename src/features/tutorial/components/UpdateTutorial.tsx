import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Textarea } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import { updateTutorial } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createTutorialSchema } from '@/utils/yup';
import { Select } from '@/components/Form/Select';
interface FormikState {
  title: string;
  description: string;
  category: number;
  vimeoId: string;
  deleteImage: boolean;
  image: any;
}

export const UpdateTutorial = ({ tutorialId, tutorials }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateTutorial, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const tutorialData = tutorials.tutorials.find(ex => ex._id === tutorialId);

  const initialValues: FormikState = {
    title: tutorialData?.title || '',
    description: tutorialData?.description || '',
    category: tutorialData?.category || 0,
    vimeoId: tutorialData?.vimeoId || '',
    image: tutorialData?.thumbnail || '',
    deleteImage: false,
  };
  const categoryOptions = [
    { value: 0, label: 'Tutorials' },
    { value: 1, label: 'Nutrition Tutorials' },
  ];
  const formik = useFormik({
    initialValues,
    validationSchema: createTutorialSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (state: FormikState) => {
    const { title, vimeoId, category, description, image, deleteImage } = state;
    mutate({ tutorialId, title, category, vimeoId, description, image, deleteImage });
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Tutorial"
        submitButton={
          <Button form="update-tutorial" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-tutorial" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Select
            label="Category"
            formik={formik}
            name="category"
            options={categoryOptions}
            value={categoryOptions.find(option => option.value === formik.values.category)}
            onChange={(option: any) => formik.setFieldValue('category', option.value)}
          />
          <Field label="Vimeo Id" formik={formik} name="vimeoId" />
          <Dropzone
            label="Thumbnail"
            name="image"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
          <Textarea label="Description" formik={formik} name="description" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
