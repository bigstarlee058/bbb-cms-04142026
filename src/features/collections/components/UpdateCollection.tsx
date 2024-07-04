import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery } from 'react-query';
import { fetchCollection, updateCollection } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createCollectionSchema } from '@/utils/yup';
import { fetchTags } from '@/features/tags/api';

type UpdateCollectionProps = {
  collectionId: string;
};

interface FormikState {
  title: string;
  tags: Array<string>;
  deleteImage: boolean;
  image: any;
}

export const UpdateCollection = ({ collectionId }: UpdateCollectionProps) => {
  const { addNotification } = useNotificationStore();
  const { data } = useQuery(['get-collection', collectionId], () => fetchCollection(collectionId));
  const { data: tags } = useQuery('get-tags', fetchTags);

  const { mutate, isLoading, isSuccess } = useMutation(updateCollection, {
    onSuccess: (message: string) => {
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
    title: data?.title || '',
    tags: data?.tags.map((v) => v._id) || [],
    image: data?.thumbnail,
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createCollectionSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (value: any) => {
    mutate({ collectionId, payload: value });
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button startIcon={<PencilIcon className="h-4 w-4" />} size="sm">
            Update Collection
          </Button>
        }
        title="Update Collection"
        submitButton={
          <Button form="update-collection" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-collection" onSubmit={formik.handleSubmit}>
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
