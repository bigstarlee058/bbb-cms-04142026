import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import {  updateEquipment } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createEquipmentSchema } from '@/utils/yup';

interface FormikState {
  title: string;
  description: string;
  link: string;
  image?: any;
  deleteImage: boolean;
}

export const UpdateEquipment = ({ equipmentId, equipments }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateEquipment, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const equipmentData = equipments.equipments.find(ex => ex._id === equipmentId);

  const initialValues: FormikState = {
    title: equipmentData?.title || '',
    description: equipmentData?.description || '',
    link: equipmentData?.link || '',
    image: equipmentData?.thumbnail || '',
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createEquipmentSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (state: FormikState) => {
    const { title, image, deleteImage, description, link } = state;
    mutate({ equipmentId, title, description, link, image, deleteImage });
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Equipment"
        submitButton={
          <Button form="update-equipment" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-equipment" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Field label="Description" formik={formik} name="description" />
          <Field label="Link" formik={formik} name="link" />
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
