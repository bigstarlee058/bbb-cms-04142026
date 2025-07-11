import { useFormik } from 'formik';
import { useMutation } from 'react-query';
import { PlusIcon } from '@heroicons/react/outline';
import { useNotificationStore } from '@/stores/notifications';
import { createEquipmentSchema } from '@/utils/yup';
import { Authorization, ROLES } from '@/lib/authorization';
import { Button } from '@/components/Elements';
import { FormDrawer, Select } from '@/components/Form';
import { Field, Dropzone } from '@/components/Form';
import { createEquipment } from '../api';
import { TextareaWithFormatting } from '@/components/Form/TextareaWithFormatting';

interface FormikState {
  title: string;
  description: string;
  link: string;
  image: any;
  deleteImage: boolean;
  collections: string[];
}

export const CreateEquipment = ({titles}) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createEquipment, {
    onSuccess: (message: string) => {
      formik.resetForm();
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const collectionTitles = titles || [];

  const initialValues: FormikState = {
    title: '',
    description: '',
    link: '',
    image: '',
    deleteImage: false,
    collections: [],
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createEquipmentSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (value: any) => {
    mutate(value);
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Equipment
          </Button>
        }
        title="Create Equipment"
        submitButton={
          <Button form="create-equipment" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-equipment" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <TextareaWithFormatting label="Description" formik={formik} name="description" />
          {/* <Field label="Description" formik={formik} name="description" /> */}
          <Field label="Link" formik={formik} name="link" />
          <Dropzone
            label="Thumbnail"
            name="image"
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
