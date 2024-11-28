import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Textarea } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import {  updateBonus } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createBonusSchema } from '@/utils/yup';

interface FormikState {
  title: string;
  description: string;
  image?: any;
  deleteImage: boolean;
  isFeatured: false;
}

export const UpdateBonus = ({ bonusId, bonuses }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateBonus, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const bonusData = bonuses.bonuses.find(ex => ex._id === bonusId);

  const initialValues: FormikState = {
    title: bonusData?.title || '',
    description: bonusData?.description || '',
    image: bonusData?.thumbnail || '',
    deleteImage: false,
    isFeatured: bonusData?.isFeatured || false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createBonusSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (state: FormikState) => {
    const { title, image, deleteImage, description, isFeatured } = state;
    mutate({ bonusId, title, description, image, deleteImage, isFeatured });
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Bonus"
        submitButton={
          <Button form="update-bonus" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-bonus" onSubmit={formik.handleSubmit}>
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
