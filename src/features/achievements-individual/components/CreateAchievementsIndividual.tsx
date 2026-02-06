import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation, useQuery } from 'react-query';
import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { achievementsIndividualSchema } from '@/utils/yup';
import { createAchievement } from '../api';
import { SelectOption } from '@/types';
import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/stores/languages';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslatableTextarea } from '@/components/Form/TranslatableTextarea';
import { queryClient } from '@/lib/react-query';
import { prepareTranslations } from '@/utils/translationHelper';
interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  image: any;
  deleteImage: boolean;
  targettype: string;
  target: string;
  value: string;
  description: string;
  descriptionTranslations: Record<string, string>;
}

export const CreateAchievementsIndividual = ({ tagtitles, othertitles }) => {
  const { addNotification } = useNotificationStore();
  const [targetTitles, setTargetTitles] = useState<any[]>([]);
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const {
    selectedLanguages,
    handleLanguageToggle,
    getFilteredTranslations,
    resetLanguages,
  } = useTranslations({
    translationFields: ['title', 'description'],
  });
  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);
  const { mutate, isLoading, isSuccess } = useMutation(createAchievement, {
    onSuccess: () => {
      queryClient.invalidateQueries('get-achievements');
      resetLanguages();
      formik.resetForm();
      addNotification({
        type: 'success',
        title: "Achievement successfully created.",
      });
    },
  });
  const initialValues: FormikState = {
    title: '',
    titleTranslations: {},
    image: '',
    deleteImage: false,
    targettype: '',
    target: '',
    value: '1',
    description: '',
    descriptionTranslations: {},
  };
  const optionTitles = ["Tags", "Others"];
  const formik = useFormik({
    initialValues,
    validationSchema: achievementsIndividualSchema,
    onSubmit: (v) => onSubmit(v),
  });

  const onSubmit = (values: any) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title', 'description'],
      imageFields: ['thumbnail'],
    });
    const payload = {
      ...values,
      ...translations,
    };
    mutate(payload);
  };


  const onChangeSelect = (value: string) => {
    formik.setFieldValue('target', '');
    if (value === "Tags") {
      setTargetTitles(tagtitles || []);
    } else if (value === "Others") {
      setTargetTitles(othertitles || []);
    } else {
      setTargetTitles([]);
    }
  }

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Achievement
          </Button>
        }
        title="Create Achievement"
        submitButton={
          <Button form="create-achievement" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="create-achievement" onSubmit={formik.handleSubmit}>
          <TranslatableInput
            formik={formik}
            name="title"
            translationField="titleTranslations"
            label="Title"
            selectedLanguages={selectedLanguages}
          />
          <Dropzone
            label="Thumbnail"
            name="image"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
          <Select
            formik={formik}
            label="Target type"
            name="targettype"
            options={optionTitles?.map((value) => ({ label: value, value: value })) || []}
            onChange={({ value }: SelectOption) => {
              formik.setFieldValue('targettype', value);
              onChangeSelect(value);
            }}
          />
          <Select
            formik={formik}
            label="Target"
            name="target"
            options={targetTitles?.map(({ title, _id, id }) => ({ label: title, value: _id || id })) || []}
            onChange={({ value }: SelectOption) => formik.setFieldValue('target', value)}
            isDisabled={!formik.values.targettype}
          />
          <Field label="Value" formik={formik} name="value" type='number' />
          <TranslatableTextarea label="Description" formik={formik} name={`description`}
            translationField={`descriptionTranslations`}
            selectedLanguages={selectedLanguages}
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
