import { Button, ConfirmationDialog } from '@/components/Elements';
import { useFormik } from 'formik';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';

import { Dropzone } from '@/components/Form';
import { createSettingsSchema } from '@/utils/yup';

interface FormikState {
  deleteImage: boolean;
  image: any;
}

export const MonthCover = ({ initialMonthCover, onSetMonthCover }) => {
  const { mutate, isSuccess } = useMutation(onSetMonthCover);

  const initialValues: FormikState = {
    image: initialMonthCover || '',
    deleteImage: false
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createSettingsSchema,
    onSubmit: (v) => onSubmit(v)
  });
  const onSubmit = (value: any) => {
    mutate(value);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <ConfirmationDialog
        icon="info"
        title="Default Month Cover"
        body={
          <form onSubmit={formik.handleSubmit}>
            <Dropzone
              name="image"
              formik={formik}
              defaultImg={formik.values.image}
              onDrop={(img) => formik.setFieldValue('image', img)}
              onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
            />
          </form>
        }
        isDone={isSuccess}
        triggerButton={
          <Button variant="danger" type="button" className="mr-2">
            Default Month Cover
          </Button>
        }
        confirmButton={
          <Button
            variant="danger"
            type="button"
            onClick={onSubmit}
          >
            Save
          </Button>
        }
      />
    </Authorization>
  );
};
