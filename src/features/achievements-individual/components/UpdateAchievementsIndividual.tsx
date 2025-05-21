import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import { updateAchievement } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createCategorySchema } from '@/utils/yup';

interface FormikState {
  title: string;
  deleteImage: boolean;
  image: any;
  type: string;
  value: string;
  description: string;
}

export const UpdateAchievementsIndividual = ({ achievementId, achievements }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateAchievement, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const typeValue = ["Week", "Lift"];

  const achievementData = achievements.achievementsIndividuals.find(ex => ex._id === achievementId);

  const initialValues: FormikState = {
    title: achievementData?.title || '',
    image: achievementData?.image || '',
    deleteImage: false,
    type: achievementData?.type || '',
    value: achievementData?.value || '1',
    description: achievementData?.description || '',
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createCategorySchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (state: FormikState) => {
    const { title, image, type , value, description,deleteImage} = state;
    mutate({ achievementId, title, image, type, value, description, deleteImage });
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Achievement"
        submitButton={
          <Button form="update-achievement" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-achievement" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Dropzone
            label="Thumbnail"
            name="thumbnail"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
          <Select
            formik={formik}
            label="Type"
            name="type"
            options={typeValue?.map((value) => ({ label: value, value: value })) || []}
            value= {{ label: formik.values.type, value: formik.values.type }}
            onChange={(value: any) =>formik.setFieldValue('type', value.value)}
          />
          <Field label="Value" formik={formik} name="value" type ='number'/>
          <Textarea label="Description" formik={formik} name="description" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
