import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery } from 'react-query';
import { fetchWarmup, updateWarmup } from "../api";
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createWarmupSchema } from '@/utils/yup';
import { Textarea } from '@/components/Form';

interface FormikState {
  title: string;
  vimeoId: string;
  description: string;
  equipments: string[];
  length: number;
  image: any;
  deleteImage: boolean;
}

export const UpdateWarmup = ({ warmupId, warmups, titles }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateWarmup, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const warmupData = warmups.warmups.find(ex => ex._id === warmupId);
  const equipmentTitles = titles || [];

  const initialValues: FormikState = {
    title: warmupData?.title || '',
    vimeoId: warmupData?.vimeoId || '',
    description: warmupData?.description || '',
    equipments: warmupData?.equipments || [],
    length: warmupData?.length || 0,
    image: warmupData?.thumbnail,
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createWarmupSchema,
    onSubmit: (v) => onSubmit(v),
  });

  const onSubmit = (state: any) => {
    mutate({ warmupId, payload: state });
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Warmup"
        submitButton={
          <Button form="update-warmup" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-warmup" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Field label="Vimeo" formik={formik} name="vimeoId" />
          <Textarea label="Description" formik={formik} name="description" />
          <Select
            isMulti
            formik={formik}
            label="Equipment"
            name="equipments"
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
