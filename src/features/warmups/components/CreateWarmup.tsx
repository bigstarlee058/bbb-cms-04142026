import { useFormik } from 'formik';
import { useMutation } from 'react-query';
import { PlusIcon } from '@heroicons/react/outline';
import { useNotificationStore } from '@/stores/notifications';
import { createWarmupSchema } from '@/utils/yup';
import { Authorization, ROLES } from '@/lib/authorization';
import { Button } from '@/components/Elements';
import { Dropzone, FormDrawer, Select } from '@/components/Form';
import { Field } from '@/components/Form';
import { createWarmup } from '../api';
import { Textarea } from '@/components/Form';

interface FormikState {
  title: string;
  vimeoId: string;
  description: string;
  equipments: string[];
  length: number;
  image: any;
  videoImage: any;
  deleteImage: boolean;
  deleteVideoImage: boolean;
}

export const CreateWarmUp = ({titles}) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createWarmup, {
    onSuccess: (message: string) => {
      formik.resetForm();
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const equipmentTitles = titles || [];

  const initialValues: FormikState = {
    title: '',
    vimeoId: '',
    description: '',
    equipments: [],
    length: 0,
    image: '',
    videoImage: '',
    deleteImage: false,
    deleteVideoImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createWarmupSchema,
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
          <Button size="sm" variant='danger' startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Warmup
          </Button>
        }
        title="Create Warmup"
        submitButton={
          <Button form="create-warmup" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-warmup" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Dropzone
            label="Thumbnail"
            name="image"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
          <Field label="Vimeo" formik={formik} name="vimeoId" />
          <Dropzone
            label="Video Thumbnail"
            name="videoImage"
            formik={formik}
            defaultImg={formik.values.videoImage}
            onDrop={(img) => formik.setFieldValue('videoImage', img)}
            onDelete={() => formik.setValues({ ...formik.values, videoImage: '', deleteVideoImage: true })}
          />
          <Textarea label="Description" formik={formik} name="description" />
          <Select
            isMulti
            formik={formik}
            label="Related Equipment"
            name="relatedEquipments"
            options={equipmentTitles?.map(({ title, id }) => ({ label: title, value: id })) || []}
            value={formik.values.equipments.map((id) => {
              const exercise = equipmentTitles?.find((exercise) => exercise._id === id);
              return { label: exercise?.title || '', value: id };
            })}
            onChange={(value: any) =>
              formik.setFieldValue(
                'equipments',
                value.map((v: any) => v.value)
              )
            }
          />
          <Field label="Length (min)" formik={formik} name="length" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
