import { PencilIcon } from '@heroicons/react/solid';
import { PlusIcon, TrashIcon } from '@heroicons/react/outline';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import { updateAchievement } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createTagSchema } from '@/utils/yup';
import { Achievement, SelectOption } from '@/types';

interface FormikState {
  title: string;
  description: string;
  achievements: Achievement[];
}

export const UpdateAchievementsGroup = ({ achievementId, achievements, titles }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateAchievement, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const individualTitles = titles || [];

  const achievementData = achievements.achievementsGroups.find(ex => ex._id === achievementId);

  const initialValues: FormikState = {
    title: achievementData?.title || '',
    description: achievementData?.description || '',
    achievements: achievementData?.achievements || [],
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createTagSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (state: FormikState) => {
    const { title, description, achievements} = state;
    mutate({ achievementId, title, description, achievements});
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
        title="Update Achievement"
        submitButton={
          <Button form="update-achievement" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-achievement" onSubmit={formik.handleSubmit}>
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
