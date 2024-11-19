import { Button } from '@/components/Elements';
import { DuplicateIcon, PlusIcon } from '@heroicons/react/outline';
import { useEffect, useState } from 'react';
import { Select, Field, DeleteConfirmation } from './custom';
import { useQuery } from 'react-query';
import { fetchExerciseTitles } from '../api';
import { ExtraExercise, SelectOption, TitleResponse } from '@/types';
import _ from 'lodash';

const EXTRA_EXERCISE_OPTIONS: SelectOption[] = [
  {
    label: 'Warn Up',
    value: '1'
  },
  {
    label: 'Back Set',
    value: '2'
  }
];

export const ExercisePlan = ({
  monthIndex,
  weekIndex,
  dayIndex,
  exerciseIndex,
  exercise,
  addExercise,
  reassignExerciseTypeIds,
  months,
  updateMonths
}) => {
  const [checkedStates, setCheckedStates] = useState([false, false, false]);

  const { data: titles, isLoading } = useQuery('get-exercise-titles', () => fetchExerciseTitles({ filterString: '' }));

  useEffect(() => {
    if (exercise.formats) {
      const newCheckedStates = ['A', 'B', 'C'].map((format) => exercise.formats.includes(format));
      setCheckedStates(newCheckedStates);
    }
  }, [exercise.formats]);

  const updateExercise = (monthIndex, weekIndex, dayIndex, exerciseIndex, updatedExercise) => {
    const updatedMonths = [...months];
    updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].exercises[exerciseIndex] = updatedExercise;
    updateMonths(updatedMonths);
  };

  const duplicateExercise = (monthIndex, weekIndex, dayIndex, exerciseIndex) => {
    const originExercise = months[monthIndex].weeks[weekIndex].days[dayIndex].exercises[exerciseIndex];
    const newExercise = { ..._.cloneDeep(originExercise), formats: [] }; // Reset formats
    const nextFormat = getNextFormat();
    const nextTypeId = getNextTypeId();
    const updatedMonths = [...months];
    if (!nextFormat) {
      newExercise.typeId = nextTypeId;
      updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].exercises.push(newExercise);
    } else
      updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].exercises.splice(exerciseIndex + 1, 0, newExercise);
    updateMonths(updatedMonths);
  };

  const deleteExercise = (monthIndex, weekIndex, dayIndex, exerciseIndex) => {
    const updatedMonths = [...months];
    const countSameType = updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].exercises.filter(
      (ex) => ex.typeId === exercise.typeId
    ).length;
    updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].exercises.splice(exerciseIndex, 1);
    updateMonths(updatedMonths);
    if (countSameType === 1) reassignExerciseTypeIds(exercise.typeId);
  };

  const deleteExtraExercise = (monthIndex, weekIndex, dayIndex, exerciseIndex, extraIndex) => {
    const updatedMonths = [...months];
    updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].exercises[exerciseIndex].extra.splice(extraIndex, 1);
    updateMonths(updatedMonths);
  };

  const updateExtraExerciseDetail = (index, key, value) => {
    const updatedExtraExercise = [...exercise.extra];
    updatedExtraExercise[index][key] = value;
    updateExerciseDetail('extra', updatedExtraExercise);
  };

  const updateExerciseDetail = (key, value) => {
    const updatedExercise = { ...exercise, [key]: value };
    updateExercise(monthIndex, weekIndex, dayIndex, exerciseIndex, updatedExercise);
  };

  // Toggle the checked state of a checkbox
  const handleCheckboxClick = (index) => {
    const newCheckedStates = checkedStates.map((state, i) => (i === index ? !state : state));
    setCheckedStates(newCheckedStates);

    const newFormats = newCheckedStates.reduce((formats, state, i) => {
      if (state) formats.push(['A', 'B', 'C'][i]);
      return formats;
    }, []);

    updateExerciseDetail('formats', newFormats);
  };

  // Check if a format is disabled in other exercises with the same typeId
  const isDisabled = (index) => {
    const format = ['A', 'B', 'C'][index];
    return months[monthIndex].weeks[weekIndex].days[dayIndex].exercises
      .filter((e) => e !== exercise && e.typeId === exercise.typeId)
      .some((e) => e.formats?.includes(format));
  };

  const handleChange = (key, value) => {
    updateExerciseDetail(key, value);
  };

  const getAddExerciseButtonTitle = () => {
    const allFormats = ['A', 'B', 'C'];
    const selectedFormats = checkedStates
      .map((isChecked, index) => (isChecked ? allFormats[index] : ''))
      .filter(Boolean);

    // Determine the next format that is not selected and not disabled
    const availableFormats = allFormats.filter((format, index) => {
      return !selectedFormats.includes(format) && !isDisabled(index);
    });

    if (selectedFormats.length === 0 && availableFormats.length === 3) {
      const nextTypeId = getNextTypeId();
      return `Add Exercise ${nextTypeId}`;
    }

    const nextFormat = availableFormats.length > 0 ? availableFormats[0] : null;

    if (nextFormat) {
      // There are available formats, show the current type ID with the next available format
      return `Add Exercise ${exercise.typeId}${nextFormat}`;
    } else {
      // All formats are selected or disabled, show the next type ID
      const nextTypeId = getNextTypeId();
      return `Add Exercise ${nextTypeId}`;
    }
  };

  const getNextFormat = () => {
    const allFormats = ['A', 'B', 'C'];
    const selectedFormats = checkedStates
      .map((isChecked, index) => (isChecked ? allFormats[index] : ''))
      .filter(Boolean);

    // Determine the next format that is not selected and not disabled
    const availableFormats = allFormats.filter((format, index) => {
      return !selectedFormats.includes(format) && !isDisabled(index);
    });

    return availableFormats.length > 0 && availableFormats.length < 3 ? availableFormats[0] : null;
  };

  const handleAddExerciseClick = () => {
    const nextFormat = getNextFormat();

    if (nextFormat) {
      // There are available formats, add exercise with the current type ID and next available format
      addExercise(monthIndex, weekIndex, dayIndex, exercise.typeId, [nextFormat]);
    } else {
      // All formats are selected or disabled, add exercise with the next type ID
      const nextTypeId = getNextTypeId();
      addExercise(monthIndex, weekIndex, dayIndex, nextTypeId, []);
    }
  };

  // Determine the next type ID
  const getNextTypeId = () => {
    // const typeIds = months.flatMap((month) =>
    //   month.weeks.flatMap((week) => week.days.flatMap((day) => day.exercises.map((ex) => ex.typeId)))
    // );
    const typeIds = [...months][monthIndex].weeks[weekIndex].days[dayIndex].exercises.flatMap((ex) => ex.typeId);
    const maxTypeId = Math.max(0, ...typeIds);
    return maxTypeId + 1;
  };

  const handleAddExtraExerciseClick = () => {
    const updatedMonths = [...months];
    const newExtraExercise: ExtraExercise = {
      sets: 0,
      reps: 0,
      weight: 0,
      rest: 0,
      load: 0,
      type: 1
    };
    updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].exercises[exerciseIndex].extra.push(newExtraExercise);
    updateMonths(updatedMonths);
  };

  return (
    <>
      <div
        className={`p-4 bg-gray-500 rounded shadow-md mt-4`}
        style={
          exercise.typeId === 1
            ? { backgroundColor: '#77F3E6' }
            : exercise.typeId === 2
            ? { backgroundColor: '#6AD9CD' }
            : exercise.typeId === 3
            ? { backgroundColor: '#5BBAB0' }
            : { backgroundColor: '#48948C' }
        }
      >
        <div className="flex mb-2 justify-between items-center">
          <h2 className="text-md font-bold">EXERCISE {exercise.typeId}</h2>
          <div className="flex gap-3">
            <Button
              variant="danger"
              name="duplicate exercise"
              startIcon={<DuplicateIcon className="h-4 w-4" />}
              onClick={() => duplicateExercise(monthIndex, weekIndex, dayIndex, exerciseIndex)}
            />
            <DeleteConfirmation
              deleteFunction={() => deleteExercise(monthIndex, weekIndex, dayIndex, exerciseIndex)}
              name={'Exercise'}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex">
            <div className="flex items-center">
              <label className="block mb-1 mr-4">Available in formats:</label>
            </div>
            <div className="flex gap-3 items-center">
              {['A', 'B', 'C'].map((label, index) => (
                <div
                  key={index}
                  onClick={() => !isDisabled(index) && handleCheckboxClick(index)}
                  className={`flex items-center justify-center w-10 h-10 border cursor-pointer transition-colors 
                  ${isDisabled(index) ? 'bg-gray-300 border-gray-400 cursor-not-allowed opacity-60' : ''}
                  `}
                  style={checkedStates[index] ? { backgroundColor: '#FFA89E' } : { backgroundColor: '#FFFFFF' }}
                >
                  <span className={`text-md font-medium ${checkedStates[index] ? 'text-white' : 'text-gray-800'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Select
              label=""
              options={titles?.map(({ title, id }) => ({ label: title, id: id })) || []}
              value={titles?.map((title) => {
                if (title.id === exercise.exerciseId) return { label: title?.title || '', value: title.id };
              })}
              isLoading={isLoading}
              onChange={(newValue: TitleResponse) => {
                handleChange('exerciseId', newValue.id);
              }}
            />
          </div>
        </div>
        <div>
          <Field label="Guideline" name="guide" value={exercise.guide} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Field label="Sets" type="number" name="sets" value={exercise.sets} onChange={handleChange} />
          <Field label="Reps" type="number" name="reps" value={exercise.reps} onChange={handleChange} />
          <Field label="Weight" type="number" name="weight" value={exercise.weight} onChange={handleChange} />
          <Field label="Rest" type="number" name="rest" value={exercise.rest} onChange={handleChange} />
        </div>
        {exercise?.extra?.length && exercise.extra.length > 0 ? (
          <>
            {exercise.extra.map((extra: ExtraExercise, index: number) => (
              <div className="p-4 bg-teal-100 rounded shadow-md mt-4">
                <div className="flex mb-2 justify-between items-center">
                  <h2 className="text-md font-bold">EXTRA SET</h2>
                  <div className="flex gap-3">
                    <DeleteConfirmation
                      deleteFunction={() => deleteExtraExercise(monthIndex, weekIndex, dayIndex, exerciseIndex, index)}
                      name={'Extra Set'}
                    />
                  </div>
                </div>
                <Select
                  label="Extra Set Type"
                  options={EXTRA_EXERCISE_OPTIONS}
                  value={{ label: `${extra.type === 1 ? 'Warm Up' : 'Back Set'}`, value: extra.type }}
                  className="w-[50%]"
                  onChange={({ value }: SelectOption) => {
                    updateExtraExerciseDetail(index, 'type', value);
                  }}
                />
                <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Field
                    label="Sets"
                    type="number"
                    name="sets"
                    value={extra.sets}
                    onChange={(key, value) => updateExtraExerciseDetail(index, key, value)}
                  />
                  <Field
                    label="Reps"
                    type="number"
                    name="reps"
                    value={extra.reps}
                    onChange={(key, value) => updateExtraExerciseDetail(index, key, value)}
                  />
                  <Field
                    label="Weight"
                    type="number"
                    name="weight"
                    value={extra.weight}
                    onChange={(key, value) => updateExtraExerciseDetail(index, key, value)}
                  />
                  <Field
                    label="Rest"
                    type="number"
                    name="rest"
                    value={extra.rest}
                    onChange={(key, value) => updateExtraExerciseDetail(index, key, value)}
                  />
                  <Field
                    label="Load"
                    type="number"
                    name="load"
                    value={extra.load}
                    onChange={(key, value) => updateExtraExerciseDetail(index, key, value)}
                  />
                </div>
              </div>
            ))}
          </>
        ) : null}
        <Button
          variant="danger"
          onClick={handleAddExtraExerciseClick}
          startIcon={<PlusIcon className="h-4 w-4" />}
          className="mt-4"
        >
          Add Extra
        </Button>
      </div>
      {exerciseIndex === months[monthIndex].weeks[weekIndex].days[dayIndex].exercises.length - 1 ? (
        <Button
          variant="danger"
          onClick={handleAddExerciseClick}
          startIcon={<PlusIcon className="h-4 w-4" />}
          className="mt-4"
        >
          {getAddExerciseButtonTitle()}
        </Button>
      ) : null}
    </>
  );
};
