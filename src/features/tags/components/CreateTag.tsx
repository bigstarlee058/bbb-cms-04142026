import { PlusIcon } from '@heroicons/react/outline';
import { Button } from '@/components/Elements';
import { Field, FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { createTag } from '../api';
import { useMutation, useQuery } from 'react-query';
import { useNotificationStore } from '@/stores/notifications';
import { queryClient } from '@/lib/react-query';
import { useFormik } from 'formik';
import { createTagSchema } from '@/utils/yup';
import { Select } from '@/components/Form';
import { fetchAllCollections } from '@/features/collections/api';

interface FormikState {
  name: string;
  featuredCollections: Array<string>;
}

export const CreateTag = () => {
  const { addNotification } = useNotificationStore();
  const { data: collections } = useQuery('get-collections', fetchAllCollections);
  const { mutate, isLoading, isSuccess } = useMutation(createTag, {
    onSuccess: (message: string) => {
      formik.resetForm();
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
    name: '',
    featuredCollections: [],
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createTagSchema,
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
            Create Tag
          </Button>
        }
        title="Create Tag"
        submitButton={
          <Button form="create-tag" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-tag" onSubmit={formik.handleSubmit}>
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
