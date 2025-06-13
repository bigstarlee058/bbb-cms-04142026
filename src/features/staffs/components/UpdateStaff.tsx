import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import { updateStaff } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createStaffSchema } from '@/utils/yup';
import { SelectOption } from '@/types';
import { TextareaWithFormatting } from '@/components/Form/TextareaWithFormatting';

interface FormikState {
  title: string;
  location: string;
  type: number;
  bio: string;
  image?: any;
  link: string;
  linkedin:string;
  tiktok:string;
  facebook:string;
  twitter:string;
  deleteImage: boolean;
}

const COACH_TYPE_OPTIONS: SelectOption[] = [
  {
    label: 'Staff',
    value: '1'
  },
  {
    label: 'Athlete',
    value: '2'
  }
];

export const UpdateStaff = ({ staffId, staffs }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateStaff, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const staffData = staffs.staffs.find((ex) => ex._id === staffId);
  const initialValues: FormikState = {
    title: staffData?.title || '',
    location: staffData?.location || '',
    type: staffData?.type || 0,
    bio: staffData?.bio || '',
    link: staffData?.link || '',
    linkedin: staffData?.linkedin || '',
    tiktok: staffData?.tiktok || '',
    facebook: staffData?.facebook || '',
    twitter: staffData?.twitter || '',
    image: staffData?.photo || '',
    deleteImage: false
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createStaffSchema,
    onSubmit: (v) => onSubmit(v)
  });
  const onSubmit = (state: FormikState) => {
    const { title, location, image, type, bio,link, linkedin, tiktok, facebook, twitter, deleteImage} = state;
    console.log("sumit")
    mutate({ staffId, title, location, image, type, bio, link, linkedin, tiktok, facebook, twitter,deleteImage });
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Staff"
        submitButton={
          <Button form="update-staff" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-staff" onSubmit={formik.handleSubmit}>
          <Field label="Name" formik={formik} name="title" />
          <Field label="Location" formik={formik} name="location" />
          <TextareaWithFormatting label="Bio" formik={formik} name="bio" />
          <Dropzone
            label="Photo"
            name="image"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
          <Select
            formik={formik}
            label="Coach Type"
            name="type"
            options={COACH_TYPE_OPTIONS}
            value={
              formik.values.type == 1
                ? { label: COACH_TYPE_OPTIONS[0].label, value: COACH_TYPE_OPTIONS[0].value }
                : { label: COACH_TYPE_OPTIONS[1].label, value: COACH_TYPE_OPTIONS[1].value }
            }
            onChange={({ value }: SelectOption) => formik.setFieldValue('type', value)}
          />
          <Field label="Button Link" formik={formik} name="link" />
          <Field label="Linkedin" formik={formik} name="linkedin" />
          <Field label="Tiktok" formik={formik} name="tiktok" />
          <Field label="Facebook" formik={formik} name="facebook" />
          <Field label="Twitter" formik={formik} name="twitter" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
