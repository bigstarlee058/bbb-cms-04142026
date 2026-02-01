import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import {  FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation,useQuery } from 'react-query';
import { updateTag } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createTagsSchema } from '@/utils/yup';
import { useLanguageStore } from '@/stores/languages';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { useTranslations } from '@/hooks/useTranslations';
import { prepareTranslations } from '@/utils/translationHelper';
import { queryClient } from '@/lib/react-query';
import { useEffect } from 'react';
interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
}

export const UpdateTag = ({ tagId, tags }) => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const {
    selectedLanguages,
    handleLanguageToggle,
    resetLanguages,
    getFilteredTranslations,
    setSelectedLanguages,
  } = useTranslations({
    translationFields: ['title'],
  });

  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);

  const { mutate, isLoading, isSuccess } = useMutation(updateTag, {
    onSuccess: (message: string) => {
      queryClient.invalidateQueries('get-tags');
      resetLanguages();
      formik.resetForm();
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const tagData = tags.tags.find(ex => ex._id === tagId);
  useEffect(() => {
  if (!tags) return;
  const validKeys = useLanguageStore.getState().languages.map(l => l.key);
  const langs = Object.values(tagData || {})
    .flatMap(o => (o && typeof o === 'object' ? Object.keys(o) : []))
    .filter(k => validKeys.includes(k));
  
  setSelectedLanguages([...new Set(langs)]);
}, [tagData, setSelectedLanguages]);
  const initialValues: FormikState = {
    title: tagData?.title || '',
    titleTranslations: tagData?.titleTranslations || {},
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createTagsSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (values: any) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title'],
      imageFields: [],
    });
    const payload = {
      ...values, titleTranslations: translations?.titleTranslations
    };
    mutate({tagId,payload});
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Tag"
        submitButton={
          <Button form="update-tag" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="update-tag" onSubmit={formik.handleSubmit}>
          <TranslatableInput
            formik={formik}
            name="title"
            translationField="titleTranslations"
            label="Title"
            selectedLanguages={selectedLanguages}
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
