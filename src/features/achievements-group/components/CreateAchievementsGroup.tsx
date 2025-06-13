import { PlusIcon, TrashIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';

import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createTagSchema } from '@/utils/yup';

import { createAchievement } from '../api';
import { Achievement, SelectOption } from '@/types';

interface FormikState {
  title: string;
  description: string;
  achievements: Achievement[]
}

export const CreateAchievementsGroup = ({titles}) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createAchievement, {
    onSuccess: () => {
      formik.resetForm();
      addNotification({
        type: 'success',
        title: "Achievement Group successfully created.",
      });
    },
  });
  const initialValues: FormikState = {
    title: '',
    description: '',
    achievements: []
  };
  const individualTitles = titles || [];
  const formik = useFormik({
    initialValues,
    validationSchema: createTagSchema,
    onSubmit: (v) => onSubmit(v),
  });

  const onSubmit = (value: any) => {
    mutate(value);
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
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Achievement Group
          </Button>
        }
        title="Create Achievement Group"
        submitButton={
          <Button form="create-achievement" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-achievement" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Textarea label="Description" formik={formik} name="description" />
          {formik.values.achievements.map((achievements, achievementIndex) => (
            <div key={achievementIndex} className="flex items-center gap-4 mb-2 bg-gray-100 p-3 rounded">
              <div className="flex-1">
                <div className="mb-1 font-semibold">Level {achievementIndex + 1}</div>
                <Select
                  formik={formik}
                  label="Achievement"
                  name="achievement"
                  options={individualTitles?.map(({ title, id }) => ({ label: title, value: id })) || []}
                  value={
                    individualTitles?.find((title) => title._id === achievements.achievementId)
                      ? {
                          label: individualTitles.find((title) => title._id === achievements.achievementId).title,
                          value: achievements.achievementId,
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
