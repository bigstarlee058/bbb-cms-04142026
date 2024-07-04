import { PlusIcon } from '@heroicons/react/outline';
import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { createCollection } from '../api';
import { useMutation, useQuery } from 'react-query';
import { useNotificationStore } from '@/stores/notifications';
import { createCollectionSchema } from '@/utils/yup';
import { useFormik } from 'formik';
import { fetchTags } from '@/features/tags/api';

interface FormikState {
  title: string;
  tags: Array<string>;
  deleteImage: boolean;
  image: any;
}

export const CreateCollection = () => {
  const { addNotification } = useNotificationStore();
  const { data: tags } = useQuery('get-tags', fetchTags);
  const { mutate, isLoading, isSuccess } = useMutation(createCollection, {
    onSuccess: (message: string) => {
      formik.resetForm();
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });
  const tagOptions = tags?.map((v) => {
    return { value: v._id, label: v.name };
  });
  const initialValues: FormikState = {
    title: '',
    image: '',
    tags: [],
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createCollectionSchema,
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
          <Button size="sm" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Collection
          </Button>
        }
        title="Create Collection"
        submitButton={
          <Button form="create-collection" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-collection" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Dropzone
            label="Thumbnail"
            name="image"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
          <Select
            className="mb-4"
            isMulti
            formik={formik}
            label="Tags"
            name="tags"
            options={tagOptions}
            value={tagOptions?.filter((el) => formik.values.tags.includes(el.value))}
            onChange={(value: any) => {
              const subs = value.map((v: any) => v.value);
              formik.setFieldValue('tags', subs);
            }}
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
