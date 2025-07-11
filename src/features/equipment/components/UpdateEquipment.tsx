import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import {  updateEquipment } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createEquipmentSchema } from '@/utils/yup';
import { TextareaWithFormatting } from '@/components/Form/TextareaWithFormatting';

interface FormikState {
  title: string;
  description: string;
  link: string;
  image?: any;
  deleteImage: boolean;
  collections: string[],
}

export const UpdateEquipment = ({ equipmentId, equipments, titles }) => {
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
  const collectionTitles = titles || [];

  const initialValues: FormikState = {
    title: equipmentData?.title || '',
    description: equipmentData?.description || '',
    link: equipmentData?.link || '',
    image: equipmentData?.thumbnail || '',
    deleteImage: false,
    collections: equipmentData?.collections || [],
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createEquipmentSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (state: FormikState) => {
    const { title, image, deleteImage, description, link, collections } = state;
    mutate({ equipmentId, title, description, link, image, deleteImage, collections });
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
          <TextareaWithFormatting label="Description" formik={formik} name="description" />
          {/* <Field label="Description" formik={formik} name="description" /> */}
          <Field label="Link" formik={formik} name="link" />
          <Dropzone
            label="Thumbnail"
            name="thumbnail"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
          <Select
            isMulti
            formik={formik}
            label="Related Collection"
            name="relatedCollections"
            options={collectionTitles?.map(({ title, id }) => ({ label: title, value: id })) || []}
            value={formik.values.collections.map((id) => {
              const exercise = collectionTitles?.find((exercise) => exercise._id === id);
              return { label: exercise?.title || '', value: id };
            })}
            onChange={(value: any) =>
              formik.setFieldValue(
                'collections',
                value.map((v: any) => v.value)
              )
            }
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
