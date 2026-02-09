import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';
import { Button } from '@/components/Elements';
import { FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { updatePhasesMainInfoSchema } from '@/utils/yup';
import { updateMainInfo } from '../api';
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { fetchLanguages } from '@/lib/api';
import { TranslatableTextarea } from '@/components/Form/TranslatableTextarea';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { TranslatableDropzone } from '@/components/Form/TranslatableDropzone';
import { useLanguageStore } from '@/stores/languages';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { useTranslations } from '@/hooks/useTranslations';
import { prepareTranslations } from '@/utils/translationHelper';
interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  contenttitle: string;
  contenttitleTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  thumbnail: any;
  thumbnailTranslations: Record<string, any>;
  deleteThumbnail: boolean;
  deleteThumbnailTranslations: Record<string, boolean>;
}

export const EditMainInfo = ({ maininfoData }) => {
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
    setSelectedLanguages,
  } = useTranslations({
    translationFields: ['title', 'contenttitle', 'description', 'thumbnail'],
  });

  const syncLanguages = () => {
    const apiLanguages = fetchedLanguages.map(l => l.key);
    const data = maininfoData?.phasesmaininfo;
    const foundLangs = Object.values(data || {})
      .flatMap(obj => obj && typeof obj === 'object' ? Object.keys(obj) : [])
      .filter(key => apiLanguages.includes(key));

    if (foundLangs.length > 0) setSelectedLanguages([...new Set(foundLangs)]);
    else resetLanguages();
  };

  useEffect(() => {
    syncLanguages();
  }, [maininfoData, fetchedLanguages]);
  const initialValues: FormikState = {
    title: maininfoData?.phasesmaininfo?.title || '',
    titleTranslations: maininfoData?.phasesmaininfo?.titleTranslations || {},
    contenttitle: maininfoData?.phasesmaininfo?.contenttitle || '',
    contenttitleTranslations: maininfoData?.phasesmaininfo?.contenttitleTranslations || {},
    description: maininfoData?.phasesmaininfo?.description || '',
    descriptionTranslations: maininfoData?.phasesmaininfo?.descriptionTranslations || {},
    thumbnail: maininfoData?.phasesmaininfo?.thumbnail || '',
    thumbnailTranslations: maininfoData?.phasesmaininfo?.thumbnailTranslations || {},
    deleteThumbnail: false,
    deleteThumbnailTranslations: {},
  };
  const formik = useFormik({
    initialValues,
    validationSchema: updatePhasesMainInfoSchema,
    onSubmit: (v) => onSubmit(v)
  });

  const { mutate, isLoading, isSuccess } = useMutation(updateMainInfo, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const onSubmit = (values: FormikState) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title', 'contenttitle', 'description'],
      imageFields: ['thumbnail'],
    });
    const payload = {
      ...values, ...translations
    }
    mutate(payload);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Edit Main Info
          </Button>
        }
        title="Edit Main Info"
        submitButton={
          <Button form="edit-maininfo" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="edit-maininfo" onSubmit={formik.handleSubmit}>
          <TranslatableInput
            formik={formik}
            name="title"
            translationField="titleTranslations"
            label="Main Title"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableDropzone
            formik={formik}
            name="thumbnail"
            translationField="thumbnailTranslations"
            label="Thumbnail"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableInput
            formik={formik}
            name="contenttitle"
            translationField="contenttitleTranslations"
            label="Content Title"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableTextarea
            formik={formik}
            name="description"
            translationField="descriptionTranslations"
            label="Content Description"
            selectedLanguages={selectedLanguages}
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
