import { useEffect } from 'react';
import { PencilIcon } from '@heroicons/react/solid';
import { useFormik } from 'formik';
import { useMutation, useQuery } from 'react-query';
import { Button } from '@/components/Elements';
import { FormDrawer, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createBonusSchema } from '@/utils/yup';
import { updateBonus } from '../api';
import { fetchLanguages } from '@/lib/api';
import { useLanguageStore } from '@/stores/languages';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { TranslatableTextarea } from '@/components/Form/TranslatableTextarea';
import { prepareTranslations } from '@/utils/translationHelper';
import { ToggleField } from '../../challenges/components/ToggleField';

interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  thumbnail: string;
  deleteThumbnail: boolean;
  isFeatured: boolean;
}

export const UpdateBonus = ({ bonusId, bonuses }) => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const bonusData = bonuses?.bonuses?.find((bonus) => bonus._id === bonusId);

  const {
    selectedLanguages,
    handleLanguageToggle,
    getFilteredTranslations,
    resetLanguages,
    setSelectedLanguages,
  } = useTranslations({
    translationFields: ['title', 'description'],
  });

  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);

  const syncLanguages = () => {
    const apiLanguages = fetchedLanguages.map((l) => l.key);
    const foundLangs = Object.values(bonusData || {})
      .flatMap((obj) => (obj && typeof obj === 'object' ? Object.keys(obj) : []))
      .filter((key) => apiLanguages.includes(key));

    if (foundLangs.length > 0) setSelectedLanguages([...new Set(foundLangs)]);
    else resetLanguages();
  };

  useEffect(() => {
    syncLanguages();
  }, [bonusData, fetchedLanguages]);

  const { mutate, isLoading, isSuccess } = useMutation(updateBonus, {
    onSuccess: (message: string) => {
      resetLanguages();
      formik.resetForm();
      addNotification({ type: 'success', title: message });
    },
  });

  const initialValues: FormikState = {
    title: bonusData?.title ?? '',
    titleTranslations: bonusData?.titleTranslations ?? {},
    description: bonusData?.description ?? '',
    descriptionTranslations: bonusData?.descriptionTranslations ?? {},
    thumbnail: bonusData?.thumbnail ?? '',
    deleteThumbnail: false,
    isFeatured: !!bonusData?.isFeatured,
  };

  const onSubmit = (values: FormikState) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title', 'description'],
      imageFields: [],
    });
    const payload = { ...values, ...translations };
    mutate({ bonusId, ...payload });
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: createBonusSchema,
    onSubmit,
  });

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Bonus"
        submitButton={
          <Button form="update-bonus" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="update-bonus" onSubmit={formik.handleSubmit}>
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
          <Dropzone
            label="Thumbnail"
            name="thumbnail"
            formik={formik}
            defaultImg={formik.values.thumbnail}
            onDrop={(img) => formik.setFieldValue('thumbnail', img)}
            onDelete={() =>
              formik.setValues({ ...formik.values, thumbnail: '', deleteThumbnail: true })
            }
          />
          <ToggleField
            label="Featured"
            value={formik.values.isFeatured}
            onChange={(v) => formik.setFieldValue('isFeatured', v)}
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
