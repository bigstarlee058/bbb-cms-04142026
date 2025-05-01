import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';

import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createFaqsSchema } from '@/utils/yup';

import { createFaqs } from '../api';

interface FormikState {
  question: string;
  answer: string;
}

export const CreateFaqs = () => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createFaqs, {
    onSuccess: (message: string) => {
      formik.resetForm();
      addNotification({
        type: 'success',
        title: message
      });
    }
  });
  const initialValues: FormikState = {
    question: '',
    answer:'',
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createFaqsSchema,
    onSubmit: (v) => onSubmit(v)
  });
  const onSubmit = (value: any) => {
    console.log("submit", value)
    mutate(value);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create FAQs
          </Button>
        }
        title="Create Faqs"
        submitButton={
          <Button form="create-section" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-section" onSubmit={formik.handleSubmit}>
          <Field label="Question" formik={formik} name="question" />
          <Textarea label="Answer" formik={formik} name="answer" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
