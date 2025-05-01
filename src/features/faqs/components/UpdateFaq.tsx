import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import { updateFaq } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createFaqsSchema } from '@/utils/yup';

interface FormikState {
  question: string;
  answer: string;
}

export const UpdateFaq = ({ faqId, faqs }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateFaq, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const faqData = faqs.faqs.find((ex) => ex._id === faqId);

  const initialValues: FormikState = {
    question: faqData?.question || '',
    answer: faqData?.answer || '',
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createFaqsSchema,
    onSubmit: (v) => onSubmit(v)
  });
  const onSubmit = (state: FormikState) => {
    const { question, answer } = state;
    console.log("sumit")
    mutate({ faqId, question, answer });
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Faqs"
        submitButton={
          <Button form="update-section" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-section" onSubmit={formik.handleSubmit}>
          <Field label="Question" formik={formik} name="question" />
          <Textarea label="Answer" formik={formik} name="answer" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
