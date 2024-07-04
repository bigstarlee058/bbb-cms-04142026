import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery } from 'react-query';
import { fetchQuiz, updateQuiz } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createQuizSchema } from '@/utils/yup';

type UpdateQuizProps = {
  quizId: string;
};

interface FormikState {
  title: string;
  level: number;
}

export const UpdateQuiz = ({ quizId }: UpdateQuizProps) => {
  const { addNotification } = useNotificationStore();
  const { data, refetch } = useQuery(['get-quiz', quizId], () => fetchQuiz(quizId));
  const { mutate, isLoading, isSuccess } = useMutation(updateQuiz, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const initialValues: FormikState = {
    title: data?.title || '',
    level: data?.level || 0,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createQuizSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (state: any) => {
    mutate({ quizId, payload: state });
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button startIcon={<PencilIcon className="h-4 w-4" />} size="sm">
            Update Quiz
          </Button>
        }
        title="Update Quiz"
        submitButton={
          <Button form="update-quiz" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-quiz" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Field type="number" label="Level" formik={formik} name="level" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
