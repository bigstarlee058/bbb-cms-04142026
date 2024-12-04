import { Button, ConfirmationDialog } from '@/components/Elements';
import { useFormik } from 'formik';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';

import { Dropzone } from '@/components/Form';
import { createSettingsSchema } from '@/utils/yup';
import { useRef } from 'react';
import { useMonthCoverContext } from '../../MonthCoverContext';

interface FormikState {
  deleteImage: boolean;
  image: any;
}

export const MonthCover = ({ initialMonthCover, onSetMonthCover }) => {
  const { mutate, isSuccess } = useMutation(onSetMonthCover);
  const { onSetCount } = useMonthCoverContext();

  const formRef = useRef<HTMLFormElement | null>(null);

  const initialValues: FormikState = {
    image: initialMonthCover || '',
    deleteImage: false
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createSettingsSchema,
    onSubmit: (v) =>{ 
      onSubmit(v)}
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
          <form ref={formRef} onSubmit={(e)=> {
            e.preventDefault();
            formik.handleSubmit(e)}}
            >
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
            disabled={!formik.values.image}
            onClick={() => {
              if (formRef) {
                formRef.current.requestSubmit();
              }
            }}
          >
            Save
          </Button>
        }
        secondaryButton={
          <Button
            variant="primary"
            type="button"
            disabled={!formik.values.image}
            onClick={() => {
              if (formRef) {
                onSetCount();
                formRef.current.requestSubmit();
              }
            }}
          >
            Apply
          </Button>
        }
      />
    </Authorization>
  );
};
