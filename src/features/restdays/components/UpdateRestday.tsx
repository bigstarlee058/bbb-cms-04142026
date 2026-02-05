import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { FormDrawer, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { updateRestday } from "../api";
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { createRestdaySchema } from '@/utils/yup';
import { useLanguageStore } from '@/stores/languages';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { TranslatableTextarea } from '@/components/Form/TranslatableTextarea';
import { useTranslations } from '@/hooks/useTranslations';
import { prepareTranslations } from '@/utils/translationHelper';

interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  vimeoId: string;
  vimeoIdTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  equipments: string[];
}

export const UpdateRestday = ({ restdayId, restdays, titles }) => {
  const { addNotification } = useNotificationStore();
  const queryClient = useQueryClient();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const {
    selectedLanguages,
    handleLanguageToggle,
    resetLanguages,
    getFilteredTranslations,
    setSelectedLanguages,
  } = useTranslations({
    translationFields: ['title', 'description', 'vimeoId']
  })
  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);
  const { mutate, isLoading, isSuccess } = useMutation(updateRestday, {
    onSuccess: (message: string) => {
      queryClient.invalidateQueries('get-restdays');
      resetLanguages();
      formik.resetForm();
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const restdayData = restdays.restdays.find(rd => rd._id === restdayId);
  const equipmentTitles = titles || [];
  useEffect(() => {
    if (!restdays) return;
    const apiLanguages = useLanguageStore.getState().languages.map(l => l.key);

    const langs = Object.values(restdayData || {})
      .flatMap(obj => obj && typeof obj === 'object' ? Object.keys(obj) : [])
      .filter(key => apiLanguages.includes(key));

    setSelectedLanguages([...new Set(langs)]);
  }, [restdayData, setSelectedLanguages]);
  const initialValues: FormikState = {
    title: restdayData?.title || '',
    titleTranslations: restdayData?.titleTranslations || {},
    vimeoId: restdayData?.vimeoId || '',
    vimeoIdTranslations: restdayData?.vimeoIdTranslations || {},
    description: restdayData?.description || '',
    descriptionTranslations: restdayData?.descriptionTranslations || {},
    equipments: restdayData?.equipments || [],
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createRestdaySchema,
    onSubmit: (v) => onSubmit(v),
  });

  const onSubmit = (values: any) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title', 'description', 'vimeoId'],
      imageFields: [],
    });
    const payload = {
      ...values, ...translations
    }
    mutate({ restdayId, payload });
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Rest day"
        submitButton={
          <Button form="update-restday" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="update-restday" onSubmit={formik.handleSubmit}>
          <TranslatableInput
            formik={formik}
            name="title"
            translationField="titleTranslations"
            label="Title"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableInput
            formik={formik}
            name="vimeoId"
            translationField="vimeoIdTranslations"
            label="Vimeo Id"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableTextarea label="Notes"
            formik={formik} name="description"
            translationField={`descriptionTranslations`}
            selectedLanguages={selectedLanguages} />
          <Select
            isMulti
            formik={formik}
            label="Equipment"
            name="equipments"
            options={equipmentTitles?.map(({ title, id }) => ({ label: title, value: id })) || []}
            value={formik.values.equipments.map((id) => {
              const exercise = equipmentTitles?.find((exercise) => exercise._id === id);
              return { label: exercise?.title || '', value: id };
            })}
            onChange={(value: any) =>
              formik.setFieldValue(
                'equipments',
                value.map((v: any) => v.value)
              )
            }
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
