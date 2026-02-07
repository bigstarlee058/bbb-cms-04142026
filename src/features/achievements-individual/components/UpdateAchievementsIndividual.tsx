import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery } from 'react-query';
import { updateAchievement } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { achievementsIndividualSchema } from '@/utils/yup';
import { SelectOption } from '@/types';
import { useState, useEffect } from 'react';
import { fetchLanguages } from '@/lib/api';
import { useLanguageStore } from '@/stores/languages';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { TranslatableTextarea } from '@/components/Form/TranslatableTextarea';
import { useTranslations } from '@/hooks/useTranslations';
import { prepareTranslations } from '@/utils/translationHelper';
import { queryClient } from '@/lib/react-query';

interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  deleteImage: boolean;
  image: any;
  targettype: string;
  target: string;
  value: string;
  description: string;
  descriptionTranslations: Record<string, string>;
}

export const UpdateAchievementsIndividual = ({ achievementId, achievements, tagtitles, othertitles }) => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);
  

  const { mutate, isLoading, isSuccess } = useMutation(updateAchievement, {
    onSuccess: (message: string) => {
      queryClient.invalidateQueries('get-achievements');
      resetLanguages();
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });
  const optionTitles = ["Tags", "Others"];

  const achievementData = achievements.achievementsIndividuals.find(ac => ac._id === achievementId);
  const {
    selectedLanguages,
    handleLanguageToggle,
    getFilteredTranslations,
    setSelectedLanguages,
    resetLanguages,
  } = useTranslations({
    translationFields: ['title', 'description'],
  });
  const syncLanguages = () => {
    const apiLanguages = fetchedLanguages.map(l => l.key);
    const foundLangs = Object.values(achievementData || {})
      .flatMap(obj => obj && typeof obj === 'object' ? Object.keys(obj) : [])
      .filter(key => apiLanguages.includes(key));

    if (foundLangs.length > 0) setSelectedLanguages([...new Set(foundLangs)]);
    else resetLanguages();
  };
  useEffect(() => {
    syncLanguages();
  }, [achievementData, fetchedLanguages]);
  const [targetTitles, setTargetTitles] = useState(achievementData?.targettype == "Tags" ? tagtitles : othertitles);
  const initialValues: FormikState = {
    title: achievementData?.title || '',
    titleTranslations: achievementData?.titleTranslations || {},
    image: achievementData?.image || '',
    deleteImage: false,
    targettype: achievementData?.targettype || '',
    target: achievementData?.target || '',
    value: achievementData?.value || '1',
    description: achievementData?.description || '',
    descriptionTranslations: achievementData?.descriptionTranslations || {},
  };
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
      imageFields: [],
    });
    const payload = {
      ...values,
      ...translations,
      achievementId,
    };
    mutate(payload);
  };

  const onChangeSelect = (value: String) => {
    if (value == "Tags") {
      setTargetTitles(tagtitles);
    } else if (value == "Others") {
      setTargetTitles(othertitles);
    }
  }
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Achievement"
        submitButton={
          <Button form="update-achievement" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="update-achievement" onSubmit={formik.handleSubmit}>
          <TranslatableInput
            formik={formik}
            name="title"
            translationField="titleTranslations"
            label="Title"
            selectedLanguages={selectedLanguages}
          />
          <Dropzone
            label="Thumbnail"
            name="thumbnail"
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
            value={
              optionTitles?.find((title) => title === formik.values.targettype)
                ? {
                  label: formik.values.targettype,
                  value: formik.values.targettype,
                }
                : null
            }
            // value= {{ label: formik.values.type, value: formik.values.type }}
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
            value={
              targetTitles?.find((title) => (title._id || title.id) === formik.values.target)
                ? {
                  label: targetTitles.find((title) => (title._id || title.id) === formik.values.target).title,
                  value: formik.values.target,
                }
                : null
            }
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
