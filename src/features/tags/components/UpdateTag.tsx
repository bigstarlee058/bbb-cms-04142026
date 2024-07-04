import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { FormDrawer, Field } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery } from 'react-query';
import { fetchTag, updateTag } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createTagSchema } from '@/utils/yup';
import { Select } from '@/components/Form';
import { fetchAllCollections } from '@/features/collections/api';

type UpdateTagProps = {
  tagId: string;
};

interface FormikState {
  name: string;
  featuredCollections: Array<string>;
}

export const UpdateTag = ({ tagId }: UpdateTagProps) => {
  const { addNotification } = useNotificationStore();
  const { data, refetch } = useQuery(['get-tag', tagId], () => fetchTag(tagId));
  const { data: collections } = useQuery('get-collections', fetchAllCollections);
  const { mutate, isLoading, isSuccess } = useMutation(updateTag, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const collectionOptions = collections?.map((v) => {
    return { value: v._id, label: v.title };
  });
  const initialValues: FormikState = {
    name: data?.name || '',
    featuredCollections: data?.featuredCollections.map((v) => v._id) || [],
  };

  const formik = useFormik({
    initialValues,
    validationSchema: createTagSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (value: any) => {
    mutate({ tagId, payload: value });
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button startIcon={<PencilIcon className="h-4 w-4" />} size="sm">
            Update Tag
          </Button>
        }
        title="Update Tag"
        submitButton={
          <Button form="update-tag" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-tag" onSubmit={formik.handleSubmit}>
          <Field label="Name" formik={formik} name="name" />
          <Select
            className="mb-4"
            isMulti
            formik={formik}
            label="Collections"
            name="featuredCollections"
            options={collectionOptions}
            value={collectionOptions?.filter((el) =>
              formik.values.featuredCollections.includes(el.value)
            )}
            onChange={(value: any) => {
              const subs = value.map((v: any) => v.value);
              formik.setFieldValue('featuredCollections', subs);
            }}
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
