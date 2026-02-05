import { useEffect } from 'react';
import { PencilIcon } from '@heroicons/react/solid';
import { PlusIcon, TrashIcon } from '@heroicons/react/outline';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery } from 'react-query';
import { queryClient } from '@/lib/react-query';
import { updateAchievement } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createTagSchema } from '@/utils/yup';
import { Achievement, SelectOption } from '@/types';
import { useLanguageStore } from '@/stores/languages';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslatableTextarea } from '@/components/Form/TranslatableTextarea';
import { prepareTranslations } from '@/utils/translationHelper';
interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  type: string;
  description: string;
  descriptionTranslations: Record<string, string>;
  thumbnail: any;
  achievements: Achievement[];
  deleteImage: boolean;
}

export const UpdateAchievementsGroup = ({ achievementId, achievements, titles }) => {
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
      queryClient.invalidateQueries('get-achievementsgroups');
      resetLanguages();
      formik.resetForm();
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const individualTitles = titles || [];

  const achievementData = achievements.achievementsGroups.find(ac => ac._id === achievementId);
  const {
    selectedLanguages,
    handleLanguageToggle,
    getFilteredTranslations,
    resetLanguages,
    setSelectedLanguages,
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
  const initialValues: FormikState = {
    title: achievementData?.title || '',
    titleTranslations: achievementData?.titleTranslations || {},
    type: achievementData?.type || '',
    description: achievementData?.description || '',
    descriptionTranslations: achievementData?.descriptionTranslations || {},
    achievements: achievementData?.achievements || [],
    thumbnail: achievementData?.thumbnail || '',
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createTagSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (values: FormikState) => {
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
      achievementId
    };

    mutate(payload);
  };

  const handleAddLevel = () => {
    const newAchievements = [...formik.values.achievements, { achievementId: '' }];
    const updatedAchievements = newAchievements.map((ach, i) => ({
      ...ach,
      index: i,
    }));
    formik.setFieldValue('achievements', updatedAchievements);
  };

  const handleRemoveLevel = (indexToRemove: number) => {
    const updated = [...formik.values.achievements];
    updated.splice(indexToRemove, 1);

    const reIndexed = updated.map((ach, i) => ({
      ...ach,
      index: i,
    }));

    formik.setFieldValue('achievements', reIndexed);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Achievement Group"
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
          <Field label="Type" formik={formik} name="type" />
          <TranslatableTextarea label="Description" formik={formik} name={`description`}
            translationField={`descriptionTranslations`}
            selectedLanguages={selectedLanguages}
          />
          <Dropzone
            label="Thumbnail"
            name="thumbnail"
            formik={formik}
            defaultImg={formik.values.thumbnail}
            onDrop={(img) => formik.setFieldValue('thumbnail', img)}
            onDelete={() => formik.setValues({ ...formik.values, thumbnail: '', deleteImage: true })}
          />
          {formik.values.achievements.map((achievements, achievementIndex) => (
            <div key={achievementIndex} className="flex items-center gap-4 mb-2 bg-gray-100 p-3 rounded">
              <div className="flex-1">
                <div className="mb-1 font-semibold">Level {achievementIndex + 1}</div>
                <Select
                  formik={formik}
                  label="Achievement"
                  name={`achievements[${achievementIndex}].achievementId`}
                  options={individualTitles?.map(({ title, _id }) => ({ label: title, value: _id })) || []}
                  value={
                    formik.values.achievements[achievementIndex]?.achievementId
                      ? {
                        label: individualTitles?.find((t) => t._id === formik.values.achievements[achievementIndex].achievementId)?.title || '',
                        value: formik.values.achievements[achievementIndex].achievementId,
                      }
                      : null
                  }
                  onChange={({ value }: SelectOption) =>
                    formik.setFieldValue(`achievements[${achievementIndex}].achievementId`, value)
                  }
                />
              </div>
              <Button
                variant="danger"
                name="duplicate month"
                startIcon={<TrashIcon className="h-4 w-4" />}
                onClick={() => handleRemoveLevel(achievementIndex)}
              />
            </div>
          ))}

          {formik.values.achievements.length < 5 ? (
            <Button variant="danger" onClick={handleAddLevel} startIcon={<PlusIcon className="h-4 w-4" />}>
              Add Level
            </Button>
          ) : (
            <span></span>
          )}
        </form>
      </FormDrawer>
    </Authorization>
  );
};
