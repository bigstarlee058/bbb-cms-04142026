import { Button } from '@/components/Elements';
import {
  DuplicateIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/outline';
import { CustomTitle } from './CustomTitle';
import { DayDetail } from './DayDetail';
import { Day, DayExercise, DayWarmup } from '@/types';
import { ExercisePlan } from './ExercisePlan';
import { useState } from 'react';
import { WarmupPlan } from './WarmupPlan';
import { DeleteConfirmation } from './DeleteConfirmation';
import _ from 'lodash';

export const DayPlan = ({ monthIndex, weekIndex, dayIndex, day, addDay, reassignDayTypeIds, months, updateMonths }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [checkedStates, setCheckedStates] = useState([false, false, false]);

  if(!months[monthIndex]?.weeks[weekIndex]?.days[dayIndex])
    return null;

  const addExercise = (monthIndex: number, weekIndex: number, dayIndex: number, newTypeId: number, newFormats: string[]) => {
    const updatedMonths = [...months];
    const newExercise: DayExercise = {
      typeId: newTypeId,
      id: '',
      guide: '',
      sets: 0,
      reps: 0,
      weight: 0,
      rest: 0,
      formats: newFormats,
    };
    updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].exercises.push(newExercise);
    updateMonths(updatedMonths);
  };

  const addWarmup = (monthIndex: number, weekIndex: number, dayIndex: number, newTypeId: number, newFormats: string[]) => {
    const updatedMonths = [...months];
    const newWarmup: DayWarmup = {
      typeId: newTypeId,
      id: '',
      title: '',
      guide: '',
      formats: newFormats,
    };
    updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].warmups.push(newWarmup);
    updateMonths(updatedMonths);
  };

  const updateDay = (monthIndex: number, weekIndex: number, dayIndex: number, updatedDay: Day) => {
    const updatedMonths = [...months];
    updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex] = updatedDay;
    updateMonths(updatedMonths);
  };

  const duplicateDay = (monthIndex: number, weekIndex: number, dayIndex: number) => {
    const originDay = months[monthIndex].weeks[weekIndex].days[dayIndex];
    // const newDay = _.cloneDeep(originDay);
    const newDay = { ..._.cloneDeep(originDay), formats: [] }; // Reset formats
    const nextFormat = getNextFormat();
    const nextTypeId = getNextTypeId();
    const updatedMonths = [...months];
    if(!nextFormat){
      newDay.typeId = nextTypeId;
      updatedMonths[monthIndex].weeks[weekIndex].days.push(newDay);
    }
    else
      updatedMonths[monthIndex].weeks[weekIndex].days.splice(dayIndex + 1, 0, newDay);
    updateMonths(updatedMonths);
  };

  const deleteDay = (monthIndex: number, weekIndex: number, dayIndex: number) => {
    const updatedMonths = [...months];
    const countSameType = updatedMonths[monthIndex].weeks[weekIndex].days.filter(d => d.typeId === day.typeId).length;
    updatedMonths[monthIndex].weeks[weekIndex].days.splice(dayIndex, 1);
    updateMonths(updatedMonths);
    if (countSameType === 1) reassignDayTypeIds(day.typeId);
  };

  const reassignWarmupTypeIds = (deletedWarmupTypeId: number) => {
    const updatedMonths = [...months];
    const warmups = updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].warmups;
    warmups.forEach((warmup, index) => {
      if (warmup.typeId > deletedWarmupTypeId) warmup.typeId--;
    });
    updateMonths(updatedMonths);
  };

  const reassignExerciseTypeIds = (deletedExerciseTypeId: number) => {
    const updatedMonths = [...months];
    const exercises = updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].exercises;
    exercises.forEach((exercise, index) => {
      if (exercise.typeId > deletedExerciseTypeId) exercise.typeId--;
    });
    updateMonths(updatedMonths);
  };

  const updateDayTitle = (title) => {
    const updatedDay = { ...day, title };
    updateDay(monthIndex, weekIndex, dayIndex, updatedDay);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Check if a format is disabled in other days with the same typeId
  const isDisabled = (index) => {
    const format = ['3', '4', '5'][index];

    return months[monthIndex].weeks[weekIndex].days
      .filter((e) => e !== day && e.typeId === day.typeId)
      .some((e) => e.formats?.includes(format));
  };

  const getAddDayButtonTitle = () => {
    const allFormats = ['3', '4', '5'];
    const selectedFormats = checkedStates
      .map((isChecked, index) => (isChecked ? allFormats[index] : ''))
      .filter(Boolean);

    // Determine the next format that is not selected and not disabled
    const availableFormats = allFormats.filter((format, index) => {
      return !selectedFormats.includes(format) && !isDisabled(index);
    });

    if (selectedFormats.length === 0 && availableFormats.length === 3) {
      const nextTypeId = getNextTypeId();
      return `Add Day ${nextTypeId}`;
    }

    const nextFormat = availableFormats.length > 0 ? availableFormats[0] : null;

    if (nextFormat) {
      // There are available formats, show the current type ID with the next available format
      return `Add Day ${day.typeId} ${nextFormat}`;
    } else {
      // All formats are selected or disabled, show the next type ID
      const nextTypeId = getNextTypeId();
      return `Add Day ${nextTypeId}`;
    }
  };

  const getNextFormat = () => {
    const allFormats = ['3', '4', '5'];
    const selectedFormats = checkedStates
      .map((isChecked, index) => (isChecked ? allFormats[index] : ''))
      .filter(Boolean);

    // Determine the next format that is not selected and not disabled
    const availableFormats = allFormats.filter((format, index) => {
      return !selectedFormats.includes(format) && !isDisabled(index);
    });

    return availableFormats.length > 0 && availableFormats.length < 3 ? availableFormats[0] : null;
  }

  const handleAddDayClick = () => {
    const nextFormat = getNextFormat();

    if (nextFormat) {
      // There are available formats, add day with the current type ID and next available format
      addDay(monthIndex, weekIndex, day.typeId, [nextFormat]);
    } else {
      // All formats are selected or disabled, add day with the next type ID
      const nextTypeId = getNextTypeId();
      addDay(monthIndex, weekIndex, nextTypeId, []);
    }
  };

  // Determine the next type ID
  const getNextTypeId = () => {
    const typeIds = months.flatMap((month) =>
      month.weeks.flatMap((week) =>
        week.days.map(e => e.typeId)
        // week.days.flatMap((day) => day.exercises.map((ex) => ex.typeId))
      )
    );
    const maxTypeId = Math.max(0, ...typeIds);
    return maxTypeId + 1;
  };

  return (
    <>
      <div
        className={`p-4 bg-gray-300 rounded shadow-md mt-4 day-${dayIndex}`}
        style={{ backgroundColor: '#EAC0AB' }}
      >
        <div className="flex mb-2 justify-between items-center">
          <CustomTitle
            type={'DAY'}
            index={day.typeId}
            customTitle={day.title}
            updateFunction={updateDayTitle}
          />
          <div className="flex gap-3">
            <Button
              variant="danger"
              name="duplicate day"
              startIcon={<DuplicateIcon className="h-4 w-4" />}
              onClick={() => duplicateDay(monthIndex, weekIndex, dayIndex)}
            />
            <DeleteConfirmation
              deleteFunction={() => deleteDay(monthIndex, weekIndex, dayIndex)}
              name={'Day'}
            />
            <Button
              variant="danger"
              name="collapse"
              startIcon={
                isCollapsed ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronUpIcon className="h-4 w-4" />
                )
              }
              onClick={toggleCollapse}
              className="ml-4"
            />
          </div>
        </div>
        <div className={`collapse-content ${isCollapsed ? 'collapsed' : 'expanded'}`}>
          <DayDetail
            monthIndex={monthIndex}
            weekIndex={weekIndex}
            dayIndex={dayIndex}
            day={day}
            states={checkedStates}
            isDisabled={isDisabled}
            updateStates={setCheckedStates}
            updateDay={updateDay}
          />
          {day.warmups.length < 1 ? (
            <Button
              variant="danger"
              onClick={() => addWarmup(monthIndex, weekIndex, dayIndex, 1, [])}
              startIcon={<PlusIcon className="h-4 w-4" />}
              className="mt-4"
            >
              Add Warmup
            </Button>
          ) : null}
          {day.warmups.map((warmup, warmupIndex) => (
            <WarmupPlan
              key={warmupIndex}
              monthIndex={monthIndex}
              weekIndex={weekIndex}
              dayIndex={dayIndex}
              warmupIndex={warmupIndex}
              warmup={warmup}
              addWarmup={addWarmup}
              reassignWarmupTypeIds={reassignWarmupTypeIds}
              months={months}
              updateMonths={updateMonths}
            />
          ))}
          {day.exercises.map((exercise, exerciseIndex) => (
            <ExercisePlan
              key={exerciseIndex}
              monthIndex={monthIndex}
              weekIndex={weekIndex}
              dayIndex={dayIndex}
              exerciseIndex={exerciseIndex}
              exercise={exercise}
              addExercise={addExercise}
              reassignExerciseTypeIds={reassignExerciseTypeIds}
              months={months}
              updateMonths={updateMonths}
            />
          ))}
          {day.exercises.length === 0 ? (
            <Button
              variant="danger"
              onClick={() => addExercise(monthIndex, weekIndex, dayIndex, 1, [])}
              startIcon={<PlusIcon className="h-4 w-4" />}
              className="mt-4"
            >
              Add Exercise
            </Button>
          ) : null}
        </div>
      </div>
      {dayIndex === months[monthIndex].weeks[weekIndex].days.length - 1 ? (
        <Button
          variant="danger"
          onClick={handleAddDayClick}
          startIcon={<PlusIcon className="h-4 w-4" />}
          className="mt-4"
        >
          {getAddDayButtonTitle()}
        </Button>
      ) : null}
    </>
  );
};
