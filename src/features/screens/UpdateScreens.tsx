import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';
import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { updateScreensSchema } from '@/utils/yup';
import { updateScreens } from './api';
import { Textarea } from '@/components/Form';
import { DeleteConfirmation } from '../workouts/components/custom';

interface FormikState {
  vimeo: string;
  image?: any;
  deleteImage: boolean;
  slides: {
    title: string;
    description: string;
  }[];
}

export const UpdateScreens = ({ screenData }) => {
  const { addNotification } = useNotificationStore();

  const initialValues: FormikState = {
    vimeo: screenData?.vimeoId || '',
    image: screenData?.imgUrl || '',
    deleteImage: false,
    slides: screenData?.slides || [{ title: '', description: '' }]
  };
  const formik = useFormik({
    initialValues,
    validationSchema: updateScreensSchema,
    onSubmit: (v) => onSubmit(v)
  });

  const { mutate, isLoading, isSuccess } = useMutation(updateScreens, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const onSubmit = (state: FormikState) => {
    const { vimeo, image, deleteImage, slides } = state;
    mutate({ vimeo, image, deleteImage, slides });
  };

  const onAddSlide = () => {
    if (formik.values.slides.length === 3) return;
    const newSlides = [...formik.values.slides, { title: '', description: '' }];
    formik.setFieldValue('slides', newSlides);
  };

  const onDeleteSlide = (index: number) => {
    const newSlides = formik.values.slides.filter((_, i) => i !== index);
    formik.setFieldValue('slides', newSlides);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PencilIcon className="h-4 w-4" />}>
            &nbsp;Update Screens
          </Button>
        }
        title="Update Screens"
        submitButton={
          <Button form="update-screens" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-screens" onSubmit={formik.handleSubmit}>
          <Field label="Vimeo" formik={formik} name="vimeo" />
          <div className="flex justify-between items-end">
            <label className="fieldLabel">Slides</label>
            <Button
              variant="danger"
              name="add slide"
              startIcon={<PlusIcon className="h-6 w-4" />}
              onClick={onAddSlide}
            />
          </div>
          {(formik.values.slides ?? []).map((_slide, index) => (
            <div key={index} className="p-4 bg-gray-200 rounded shadow-md mt-4">
              <div className="flex justify-between items-end">
                <label className="fieldLabel">Slide</label>
                <Button variant="danger" startIcon={<TrashIcon className="h-4 w-4" />} onClick={() => onDeleteSlide(index)}></Button>
              </div>
              <Field label="Title" formik={formik} name={`slides[${index}].title`} />
              <Textarea label="Description" formik={formik} name={`slides[${index}].description`} />
            </div>
          ))}
          <Dropzone
            label="Thumbnail"
            name="thumbnail"
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
