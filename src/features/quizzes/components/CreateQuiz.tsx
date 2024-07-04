import { PlusIcon } from '@heroicons/react/outline';
import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { createQuiz } from '../api';
import { useMutation } from 'react-query';
import { useNotificationStore } from '@/stores/notifications';
import { queryClient } from '@/lib/react-query';
import { createQuizSchema } from '@/utils/yup';
import { useFormik } from 'formik';
import { ResponseMessage } from '@/types';

interface FormikState {
  title: string;
  level: number;
}

export const CreateQuiz = () => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createQuiz, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });
  const initialValues: FormikState = {
    title: '',
    level: 0,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createQuizSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (value: FormikState) => {
    mutate(value);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Quiz
          </Button>
        }
        title="Create Quiz"
        submitButton={
          <Button form="create-quiz" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-quiz" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Field type="number" label="Level" formik={formik} name="level" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
