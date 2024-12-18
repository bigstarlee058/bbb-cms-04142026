import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import { updateCircuit } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createCircuitSchema } from '@/utils/yup';
import { PlusIcon, TrashIcon } from '@heroicons/react/outline';
import { SelectOption } from '@/types';
import { DeleteConfirmation } from '@/features/workouts/components/custom';

const EXTRA_EXERCISE_OPTIONS: SelectOption[] = [
  {
    label: 'Warm-up Set',
    value: '1'
  },
  {
    label: 'Normal Set',
    value: '3'
  },
  {
    label: 'Back-off Set',
    value: '2'
  }
];

interface FormikState {
  title: string;
  exercises: {
    exerciseId: string;
    guide: string;
    extra: {
      sets: number;
      reps: number;
      rest: number;
      load: number;
      type: number;
      weight: number;
    }[];
  }[];
}

export const UpdateCircuit = ({ circuitId, circuits, titles }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateCircuit, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const exerciseTitles = titles || [];

  const defaultExercise = {
    exerciseId: '',
    guide: '',
    extra: [
      {
        sets: undefined,
        reps: undefined,
        rest: undefined,
        load: undefined,
        type: 1,
        weight: undefined
      }
    ]
  };

  const circuitData = circuits.circuits.find((ex) => ex._id === circuitId);

  const initialValues: FormikState = {
    title: circuitData?.title || '',
    exercises: circuitData?.exercises || []
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createCircuitSchema,
    onSubmit: (v) => onSubmit(v)
  });
  const onSubmit = (state: FormikState) => {
    const { title, exercises } = state;
    mutate({ circuitId, title, exercises: exercises as any });
  };

  const onAddExercise = () => {
    const newExercises = [...formik.values.exercises, defaultExercise];
    formik.setFieldValue('exercises', newExercises);
  };

  const onDeleteExercise = (index: number) => {
    const newSlides = formik.values.exercises.filter((_, i) => i !== index);
    formik.setFieldValue('exercises', newSlides);
  };

  const onAddSet = (exeIndex: number) => {
    const newExercises = [...formik.values.exercises];
    newExercises[exeIndex].extra.push(defaultExercise.extra[0]);
    formik.setFieldValue('exercises', newExercises);
  };

  const getExercise = (exerciseId: string) => {
    return exerciseTitles?.find((exercise) => exercise._id === exerciseId);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Circuit"
        submitButton={
          <Button form="update-circuit" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-circuit" onSubmit={formik.handleSubmit}>
          <Field label="Name" formik={formik} name="title" />
          <div className="flex justify-between items-end">
            <label className="fieldLabel">Exercises</label>
            <Button
              variant="danger"
              name="add exercise"
              startIcon={<PlusIcon className="h-6 w-4" />}
              onClick={onAddExercise}
            />
          </div>
          {(formik.values.exercises ?? []).map((_exercise, exeIndex) => (
            <div key={exeIndex} className="p-4 bg-teal-300 rounded shadow-md mt-4">
              <div className="flex justify-between items-end">
                <label className="fieldLabel">Exercise</label>
                <Button
                  variant="danger"
                  startIcon={<TrashIcon className="h-4 w-4" />}
                  onClick={() => onDeleteExercise(exeIndex)}
                ></Button>
              </div>
              <Select
                formik={formik}
                label="Exercises"
                name="exercises"
                options={exerciseTitles?.map(({ title, id }) => ({ label: title, value: id })) || []}
                value={{
                  label: getExercise(formik.values.exercises[exeIndex].exerciseId)?.title || '',
                  value: getExercise(formik.values.exercises[exeIndex].exerciseId)?._id
                }}
                onChange={({ value }: SelectOption) => formik.setFieldValue(`exercises[${exeIndex}].exerciseId`, value)}
              />
              <Field label="Guideline" formik={formik} name={`exercises[${exeIndex}].guide`} />
              {formik.values.exercises[exeIndex].extra.map(({ type }, extraIndex) => (
                <div key={extraIndex} className="p-4 bg-teal-100 rounded shadow-md mt-4">
                  <div className="flex mb-2 justify-between items-center">
                    <h2 className="text-md font-bold">SET</h2>
                    <div className="flex gap-3">
                      <DeleteConfirmation deleteFunction={() => {}} name={'Set'} />
                    </div>
                  </div>
                  <Select
                    label="Set Type"
                    options={EXTRA_EXERCISE_OPTIONS}
                    value={{
                      label: `${type == 1 ? 'Warm-up Set' : type == 3 ? 'Normal Set' : 'Back-off Set'}`,
                      value: type
                    }}
                    className="w-[50%]"
                    onChange={({ value }: SelectOption) =>
                      formik.setFieldValue(`exercises[${exeIndex}].extra[${extraIndex}].type`, value)
                    }
                    formik={formik}
                    name="type"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Field
                      label="Sets"
                      type="number"
                      name={`exercises[${exeIndex}].extra[${extraIndex}].sets`}
                      formik={formik}
                    />
                    <Field
                      label="Reps"
                      type="number"
                      name={`exercises[${exeIndex}].extra[${extraIndex}].reps`}
                      formik={formik}
                    />
                    <Field
                      label="Weight"
                      type="number"
                      name={`exercises[${exeIndex}].extra[${extraIndex}].weight`}
                      formik={formik}
                    />
                    <Field
                      label="Rest"
                      type="number"
                      name={`exercises[${exeIndex}].extra[${extraIndex}].rest`}
                      formik={formik}
                    />
                    <Field
                      label="Load"
                      type="number"
                      name={`exercises[${exeIndex}].extra[${extraIndex}].load`}
                      formik={formik}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="danger"
                onClick={() => onAddSet(exeIndex)}
                startIcon={<PlusIcon className="h-4 w-4" />}
                className="mt-4"
              >
                Set
              </Button>
            </div>
          ))}
        </form>
      </FormDrawer>
    </Authorization>
  );
};
