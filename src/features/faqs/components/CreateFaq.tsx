import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation, useQuery } from 'react-query';
import { useEffect } from 'react';

import { Button } from '@/components/Elements';
import { FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createFaqsSchema } from '@/utils/yup';
import { createFaq } from '../api';

import { fetchLanguages } from '@/lib/api';
import { useLanguageStore } from '@/stores/languages';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { TranslatableTextarea } from '@/components/Form/TranslatableTextarea';
import { prepareTranslations } from '@/utils/translationHelper';

interface FormikState {
  question: string;
  questionTranslations: Record<string, string>;
  answer: string;
  answerTranslations: Record<string, string>;
}

export const CreateFaq = () => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);

  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);

  const {
    selectedLanguages,
    handleLanguageToggle,
    getFilteredTranslations,
    resetLanguages,
  } = useTranslations({
    translationFields: ['question', 'answer'],
  });

  const { mutate, isLoading, isSuccess } = useMutation(createFaq, {
    onSuccess: (message: string) => {
      formik.resetForm();
      resetLanguages();
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const initialValues: FormikState = {
    question: '',
    questionTranslations: {},
    answer: '',
    answerTranslations: {},
  };

  const formik = useFormik({
    initialValues,
    validationSchema: createFaqsSchema,
    onSubmit: (v) => onSubmit(v),
  });

  const onSubmit = (values: FormikState) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['question', 'answer'],
      imageFields: [],
    });
    const payload = { ...values, ...translations };
    mutate(payload);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create FAQ
          </Button>
        }
        title="Create FAQ"
        submitButton={
          <Button form="create-faq" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="create-faq" onSubmit={formik.handleSubmit}>
          <TranslatableInput
            formik={formik}
            name="question"
            translationField="questionTranslations"
            label="Question"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableTextarea
            formik={formik}
            name="answer"
            translationField="answerTranslations"
            label="Answer"
            selectedLanguages={selectedLanguages}
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};