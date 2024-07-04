import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery } from 'react-query';
import { fetchEquipment, updateEquipment } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createEquipmentSchema } from '@/utils/yup';

type UpdateEquipmentProps = {
  equipmentId: string;
};

interface FormikState {
  title: string;
  price: number;
  link: string;
  image: any;
  deleteImage: boolean;
}

export const UpdateEquipment = ({ equipmentId }: UpdateEquipmentProps) => {
  const { addNotification } = useNotificationStore();
  const { data } = useQuery(['get-equipment', equipmentId], () =>
    fetchEquipment(equipmentId)
  );
  const { mutate, isLoading, isSuccess } = useMutation(updateEquipment, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const initialValues: FormikState = {
    title: data?.title || '',
    price: data?.price || 0,
    link: data?.link || '',
    image: data?.thumbnail,
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createEquipmentSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (state: any) => {
    mutate({ equipmentId, payload: state });
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button startIcon={<PencilIcon className="h-4 w-4" />} size="sm">
            Update Equipment
          </Button>
        }
        title="Update Equipment"
        submitButton={
          <Button form="update-equipment" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-equipment" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Field label="Price" formik={formik} name="price" />
          <Field label="Link" formik={formik} name="link" />
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
