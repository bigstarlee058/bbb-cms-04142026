import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import { updateSection } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createSectionSchema } from '@/utils/yup';

interface FormikState {
  title: string;
  description: string;
  vimeoId: string;
}

export const UpdateSection = ({ sectionId, sections }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateSection, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const sectionData = sections.sections.find((ex) => ex._id === sectionId);

  const initialValues: FormikState = {
    title: sectionData?.title || '',
    description: sectionData?.description || '',
    vimeoId: sectionData?.vimeoId || '',
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createSectionSchema,
    onSubmit: (v) => onSubmit(v)
  });
  const onSubmit = (state: FormikState) => {
    const { title, description, vimeoId } = state;
    console.log("sumit")
    mutate({ sectionId, title, description, vimeoId });
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Section"
        submitButton={
          <Button form="update-section" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-section" onSubmit={formik.handleSubmit}>
          <Field label="Name" formik={formik} name="title" />
          <Textarea label="Description" formik={formik} name="description" />
          <Field label="Vimeo Id" formik={formik} name="vimeoId" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
