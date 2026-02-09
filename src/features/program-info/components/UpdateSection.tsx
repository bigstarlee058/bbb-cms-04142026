import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import { updateSection } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createSectionSchema } from '@/utils/yup';
import { TextareaWithFormatting } from '@/components/Form/TextareaWithFormatting';
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { fetchLanguages } from '@/lib/api';
import { useLanguageStore } from '@/stores/languages';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { TranslatableTextareaWithFormatting } from '@/components/Form/TranslatableTextareaWithFormatting';
import { prepareTranslations } from '@/utils/translationHelper';
interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  vimeoId: string;
  vimeoIdTranslations: Record<string, string>;
  variations: string[];
  formats: string[];
}

export const UpdateSection = ({ sectionId, sections }) => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const sectionData = sections.sections.find((se) => se._id === sectionId);
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
    translationFields: ['title', 'description', 'vimeoId'],
  });

  const syncLanguages = () => {
    const apiLanguages = fetchedLanguages.map(l => l.key);
    const foundLangs = Object.values(sectionData || {})
      .flatMap(obj => obj && typeof obj === 'object' ? Object.keys(obj) : [])
      .filter(key => apiLanguages.includes(key));

    if (foundLangs.length > 0) setSelectedLanguages([...new Set(foundLangs)]);
    else resetLanguages();
  };

  useEffect(() => {
    syncLanguages();
  }, [sectionData, fetchedLanguages]);
  const { mutate, isLoading, isSuccess } = useMutation(updateSection, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const initialValues: FormikState = {
    title: sectionData?.title || '',
    titleTranslations: sectionData?.titleTranslations || {},
    description: sectionData?.description || '',
    descriptionTranslations: sectionData?.descriptionTranslations || {},
    vimeoId: sectionData?.vimeoId || '',
    vimeoIdTranslations: sectionData?.vimeoIdTranslations || {},
    variations: sectionData?.variations || [],
    formats: sectionData?.formats || [],
  };
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: createSectionSchema,
    onSubmit: (v) => onSubmit(v)
  });
  const onSubmit = (values: FormikState) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title', 'description', 'vimeoId'],
      imageFields: [],
    });
    mutate({
      sectionId, ...values,
      ...translations
    });
  };
  const handleVariationCheckboxClick = (label: string, _: number) => {
    const currentValues = formik.values.variations;
    let newValues;

    if (currentValues.includes(label)) {
      // Remove the label
      newValues = currentValues.filter((item) => item !== label);
    } else {
      // Add the label
      newValues = [...currentValues, label];
    }

    // Sort the newValues array in ascending numerical order
    newValues.sort((a, b) => Number(a) - Number(b));
    formik.setFieldValue('variations', newValues);
  };
  const handleFormatCheckboxClick = (label: string, _: number) => {
    const currentFormats = formik.values.formats;
    let newFormats;

    if (currentFormats.includes(label)) {
      // Remove the label
      newFormats = currentFormats.filter((item) => item !== label);
    } else {
      // Add the label
      newFormats = [...currentFormats, label];
    }

    // Sort the newValues array in ascending numerical order
    newFormats.sort();
    formik.setFieldValue('formats', newFormats);
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Section"
        submitButton={
          <Button form="update-section" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="update-section" onSubmit={formik.handleSubmit}>
          <TranslatableInput
            formik={formik}
            name="title"
            translationField="titleTranslations"
            label="Name"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableTextareaWithFormatting
            formik={formik}
            name="description"
            translationField="descriptionTranslations"
            label="Description"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableInput
            formik={formik}
            name="vimeoId"
            translationField="vimeoIdTranslations"
            label="Vimeo Id"
            selectedLanguages={selectedLanguages}
          />
          <div className="flex mt-3">
            <div className="flex items-center">
              <label className="block mb-1 mr-4">Available in variations:</label>
            </div>
            <div className="flex gap-3">
              {['3', '4', '5'].map((label, index) => (
                <div
                  key={index}
                  onClick={() => handleVariationCheckboxClick(label, index)}
                  className={`flex items-center justify-center w-10 h-10 border cursor-pointer transition-colors`}
                  style={formik.values.variations.includes(label) ? { backgroundColor: '#00A89E' } : { backgroundColor: '#FFFFFF' }}
                >
                  <span className={`text-md font-medium ${formik.values.variations.includes(label) ? 'text-white' : 'text-gray-800'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex mt-3">
            <div className="flex items-center">
              <label className="block mb-1 mr-4">Available in formats:</label>
            </div>
            <div className="flex gap-3">
              {['A', 'B', 'C'].map((label, index) => (
                <div
                  key={index}
                  onClick={() => handleFormatCheckboxClick(label, index)}
                  className={`flex items-center justify-center w-10 h-10 border cursor-pointer transition-colors`}
                  style={formik.values.formats.includes(label) ? { backgroundColor: '#00A89E' } : { backgroundColor: '#FFFFFF' }}
                >
                  <span className={`text-md font-medium ${formik.values.formats.includes(label) ? 'text-white' : 'text-gray-800'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </form>
      </FormDrawer>
    </Authorization>
  );
};
