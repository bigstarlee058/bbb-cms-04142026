import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery } from 'react-query';
import { fetchRestday, updateRestday } from "../api";
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createRestdaySchema } from '@/utils/yup';

interface FormikState {
  title: string;
  vimeoId: string;
  description: string;
  equipments: string[];
}

export const UpdateRestday = ({ restdayId, restdays, titles }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateRestday, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const restdayData = restdays.restdays.find(ex => ex._id === restdayId);
  const equipmentTitles = titles || [];

  const initialValues: FormikState = {
    title: restdayData?.title || '',
    vimeoId: restdayData?.vimeoId || '',
    description: restdayData?.description || '',
    equipments: restdayData?.equipments || [],
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createRestdaySchema,
    onSubmit: (v) => onSubmit(v),
  });

  const onSubmit = (state: any) => {
    mutate({ restdayId, payload: state });
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Restday"
        submitButton={
          <Button form="update-restday" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-restday" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Field label="Vimeo" formik={formik} name="vimeoId" />
          <Field label="Description" formik={formik} name="description" />
          <Select
            isMulti
            formik={formik}
            label="Equipments"
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
        </form>
      </FormDrawer>
    </Authorization>
  );
};
