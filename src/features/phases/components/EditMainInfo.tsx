import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';

import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { updatePhasesMainInfoSchema } from '@/utils/yup';

import { updateMainInfo } from '../api';

interface FormikState {
  title: string;
  contenttitle: string;
  description: string;
  image?: any; 
  deleteImage: boolean;
}

export const EditMainInfo = ({maininfoData}) => {
  const { addNotification } = useNotificationStore();
  
    const initialValues: FormikState = {
      title: maininfoData?.phasesmaininfo.title || '',
      contenttitle: maininfoData?.phasesmaininfo.contenttitle || '',
      description: maininfoData?.phasesmaininfo.description || '',
      deleteImage: false,
      image: maininfoData?.phasesmaininfo.thumbnail || '',
      
    };

    console.log("maininfoData", maininfoData)
   const formik = useFormik({
      initialValues,
      validationSchema: updatePhasesMainInfoSchema,
      onSubmit: (v) => onSubmit(v)
    });
  
    const { mutate, isLoading, isSuccess } = useMutation(updateMainInfo, {
      onSuccess: (message: string) => {
        addNotification({
          type: 'success',
          title: message
        });
      }
    });
  
    const onSubmit = (state: FormikState) => {
      const { title, contenttitle, description, image, deleteImage,} = state;
      mutate({ title, contenttitle, description, image, deleteImage });
    };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Edit Main Info
          </Button>
        }
        title="Edit Main Info"
        submitButton={
          <Button form="create-section" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-section" onSubmit={formik.handleSubmit}>
          <Field label="Main Title" formik={formik} name="title" />

          <Dropzone
            label="Thumbnail"
            name="thumbnail"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
          <Field label="Content Title" formik={formik} name="contenttitle" />
          <Textarea label="Content Description" formik={formik} name="description" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
