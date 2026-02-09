import { PencilIcon } from '@heroicons/react/solid';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Button } from '@/components/Elements';
import { FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createChallengeSchema } from '@/utils/yup';
import { updateChallenge } from '../api';
import { ToggleField } from './ToggleField';
import { useLanguageStore } from '@/stores/languages';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { TranslatableTextarea } from '@/components/Form/TranslatableTextarea';
import { TranslatableDropzone } from '@/components/Form/TranslatableDropzone';
import { prepareTranslations } from '@/utils/translationHelper';
interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  link: string;
  linkTranslations: Record<string, string>;
  buttonText: string;
  buttonTextTranslations: Record<string, string>;
  photo: any;
  photoTranslations: Record<string, any>;
  deleteImage: boolean;
  deleteImageTranslations: Record<string, string>;
  isHide: boolean;
}
export const UpdateChallenge = ({ challengeId, challenges }) => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const challengeData = challenges?.challenges?.find((ex) => ex._id === challengeId);
  const {
    selectedLanguages,
    handleLanguageToggle,
    getFilteredTranslations,
    resetLanguages,
    setSelectedLanguages,
  } = useTranslations({
    translationFields: ['title', 'description', 'photo', 'link', 'buttonText'],
  });

  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);

  const syncLanguages = () => {
    const apiLanguages = fetchedLanguages.map(l => l.key);
    const foundLangs = Object.values(challengeData || {})
      .flatMap(obj => obj && typeof obj === 'object' ? Object.keys(obj) : [])
      .filter(key => apiLanguages.includes(key));

    if (foundLangs.length > 0) setSelectedLanguages([...new Set(foundLangs)]);
    else resetLanguages();
  };
  useEffect(() => {
    syncLanguages();
  }, [challengeData, fetchedLanguages]);
  const { mutate, isLoading, isSuccess } = useMutation(updateChallenge, {
    onSuccess: (message: string) => {
      addNotification({ type: 'success', title: message });
    }
  });
  const initialValues: FormikState = {
    title: challengeData?.title ?? '',
    titleTranslations: challengeData?.titleTranslations ?? {},
    description: challengeData?.description ?? '',
    descriptionTranslations: challengeData?.descriptionTranslations ?? {},
    link: challengeData?.link ?? '',
    linkTranslations: challengeData?.linkTranslations ?? {},
    buttonText: challengeData?.buttonText ?? '',
    buttonTextTranslations: challengeData?.buttonTextTranslations ?? {},
    photo: challengeData?.photo ?? '',
    photoTranslations: challengeData?.photoTranslations ?? {},
    deleteImage: false,
    deleteImageTranslations: {},
    isHide: !!challengeData?.isHide,
  };

  const onSubmit = (values: FormikState) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title', 'description', 'link', 'buttonText'],
      imageFields: ['photo'],
    });
    const payload = {
      ...values, ...translations
    }
    console.log(payload)
    mutate({ challengeId, ...payload });
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: createChallengeSchema,
    onSubmit
  });

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Challenge"
        submitButton={
          <Button form="update-challenge" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="update-challenge" onSubmit={formik.handleSubmit}>
          <TranslatableInput
            formik={formik}
            name="title"
            translationField="titleTranslations"
            label="Title"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableTextarea
            formik={formik}
            name="description"
            translationField="descriptionTranslations"
            label="Description"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableInput
            formik={formik}
            name="link"
            translationField="linkTranslations"
            label="Link"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableInput
            formik={formik}
            name="buttonText"
            translationField="buttonTextTranslations"
            label="Button Text"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableDropzone
            formik={formik}
            name="photo"
            translationField="photoTranslations"
            label="Photo"
            selectedLanguages={selectedLanguages}
          />
          <ToggleField
            label="Visible"
            value={formik.values.isHide}
            onChange={(v) => formik.setFieldValue('isHide', v)}
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};