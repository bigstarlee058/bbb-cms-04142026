import { useFormik } from 'formik';
import { useMutation } from 'react-query';
import { PlusIcon } from '@heroicons/react/outline';
import { useNotificationStore } from '@/stores/notifications';
import { createWarmupSchema } from '@/utils/yup';
import { Authorization, ROLES } from '@/lib/authorization';
import { Button } from '@/components/Elements';
import { FormDrawer, Select } from '@/components/Form';
import { Field } from '@/components/Form';
import { createWarmup } from '../api';

interface FormikState {
  title: string;
  vimeoId: string;
  description: string;
  equipments: string[];
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
            Create WarmUp
          </Button>
        }
        title="Create WarmUp"
        submitButton={
          <Button form="create-warmup" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-warmup" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Field label="Vimeo" formik={formik} name="vimeoId" />
          <Field label="Description" formik={formik} name="description" />
          <Select
            isMulti
            formik={formik}
            label="Related Equipments"
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
          {/* <Field label="Equipment" formik={formik} name="equipment" /> */}
        </form>
      </FormDrawer>
    </Authorization>
  );
};
