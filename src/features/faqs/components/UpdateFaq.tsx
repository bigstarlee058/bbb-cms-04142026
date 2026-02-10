import { PencilIcon } from '@heroicons/react/solid';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';

import { Button } from '@/components/Elements';
import { FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createFaqsSchema } from '@/utils/yup';
import { updateFaq } from '../api';

import { fetchLanguages } from '@/lib/api';
import { useLanguageStore } from '@/stores/languages';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { TranslatableTextarea } from '@/components/Form/TranslatableTextarea';

interface FormikState {
  question: string;
  questionTranslations: Record<string, string>;
  answer: string;
  answerTranslations: Record<string, string>;
}

export const UpdateFaq = ({ faqId, faqs }) => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);

  const faqData = faqs?.faqs?.find((ex) => ex._id === faqId);

  const {
    selectedLanguages,
    handleLanguageToggle,
    getFilteredTranslations,
    setSelectedLanguages,
  } = useTranslations({
    translationFields: ['question', 'answer'],
  });

  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);

  useEffect(() => {
    if (!faqData) return;
    const apiLanguages = useLanguageStore.getState().languages.map((l) => l.key);

    const langs = Object.values(faqData || {})
      .flatMap((obj) => (obj && typeof obj === 'object' ? Object.keys(obj) : []))
      .filter((key) => apiLanguages.includes(key));

    setSelectedLanguages([...new Set(langs)]);
  }, [faqData, setSelectedLanguages]);

  const { mutate, isLoading, isSuccess } = useMutation(updateFaq, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const initialValues: FormikState = {
    question: faqData?.question || '',
    questionTranslations: faqData?.questionTranslations || {},
    answer: faqData?.answer || '',
    answerTranslations: faqData?.answerTranslations || {},
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: createFaqsSchema,
    onSubmit: (v) => onSubmit(v),
  });

  const onSubmit = (values: FormikState) => {
    const translations = getFilteredTranslations(values, true);
    const payload = {
      ...values,
      questionTranslations: translations?.questionTranslations,
      answerTranslations: translations?.answerTranslations,
    };
    mutate({ faqId, ...payload });
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update FAQ"
        submitButton={
          <Button form="update-faq" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="update-faq" onSubmit={formik.handleSubmit}>
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