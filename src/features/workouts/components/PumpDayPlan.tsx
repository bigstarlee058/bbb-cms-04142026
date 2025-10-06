import { Button } from '@/components/Elements';
import { DuplicateIcon, PlusIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';
import { CustomTitle } from './CustomTitle';
import { DayDetail } from './DayDetail';
import { Day, DayExercise, DayWarmup } from '@/types';
import { ExercisePlan } from './ExercisePlan';
import { useEffect, useState } from 'react';
import { WarmupPlan } from './WarmupPlan';
import { DeleteConfirmation } from './custom/DeleteConfirmation';
import _ from 'lodash';
import { CircuitPlan } from './CircuitPlan';

export const DayPlan = ({
  monthIndex,
  weekIndex,
  dayIndex,
  day,
  addDay,
  reassignDayTypeIds,
  months,
  updateMonths,
  isSevenDays,
  isWeekCollapsed,
  isPumpDay = false,
  updateDays = (val) => {},
  days = []
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [checkedStates, setCheckedStates] = useState([false, false, false]);

  if (!isPumpDay && !months[monthIndex]?.weeks[weekIndex]?.days[dayIndex]) return null;

  useEffect(() => {
    if (!isPumpDay && isWeekCollapsed) setIsCollapsed(true);
  }, [isWeekCollapsed]);

  const addExercise = (
    monthIndex: number,
    weekIndex: number,
    dayIndex: number,
    newTypeId: number,
    newFormats: string[]
  ) => {
    if (isPumpDay) {
      const updatedDays = [...days];
      const newExercise: DayExercise = {
        typeId: newTypeId,
        exerciseId: '',
        guide: '',
        sets: 0,
        reps: 0,
        weight: 0,
        rest: 0,
        formats: newFormats,
        status: '',
        extra: []
      };
      updatedDays[dayIndex].exercises.push(newExercise);
      updateDays(updatedDays);
    } else {
      const updatedMonths = [...months];
      const newExercise: DayExercise = {
        typeId: newTypeId,
        exerciseId: '',
        guide: '',
        sets: 0,
        reps: 0,
        weight: 0,
        rest: 0,
        formats: newFormats,
        status: '',
        extra: []
      };
      updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].exercises.push(newExercise);
      updateMonths(updatedMonths);
    }
  };

  const addCircuit = (dayIndex: number, newTypeId: number, newFormats: string[]) => {
    const updatedDays = [...days];
    const newCircuit: { round: number; formats: string[]; typeId: number; circuitExercises: DayExercise[] } = {
      round: 0,
      formats: newFormats,
      typeId: newTypeId,
      circuitExercises: [
        {
          exerciseId: '',
          guide: '',
          sets: 0,
          reps: 0,
          weight: 0,
          rest: 0,
          status: '',
          extra: []
        }
      ]
    };
    updatedDays[dayIndex].circuits.push(newCircuit);
    updateDays(updatedDays);
  };

  const addWarmup = (
    monthIndex: number,
    weekIndex: number,
    dayIndex: number,
    newTypeId: number,
    newFormats: string[]
  ) => {
    if (isPumpDay) {
      const updatedDays = [...days];
      const newWarmup: DayWarmup = {
        typeId: newTypeId,
        warmupId: '',
        title: '',
        guide: '',
        formats: newFormats
      };
      updatedDays[dayIndex].warmups.push(newWarmup);
      updateDays(updatedDays);
    } else {
      const updatedMonths = [...months];
      const newWarmup: DayWarmup = {
        typeId: newTypeId,
        warmupId: '',
        title: '',
        guide: '',
        formats: newFormats
      };
      updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].warmups.push(newWarmup);
      updateMonths(updatedMonths);
    }
  };

  const updateDay = (
    monthIndex: number,
    weekIndex: number,
    dayIndex: number,
    updatedDay: Day,
    isTypeIdUpdate?: boolean,
    typeId?: number
  ) => {
    if (isPumpDay) {
      const updatedDays = [...days];
      updatedDays[dayIndex] = updatedDay;
      updateDays(updatedDays);
    } else {
      const updatedMonths = [...months];
      updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex] = updatedDay;
      updateMonths(updatedMonths);
    }
  };

  const duplicateDay = (monthIndex: number, weekIndex: number, dayIndex: number) => {
    let originDay;
    if (isPumpDay) {
      originDay = days[dayIndex];
    } else {
      originDay = months[monthIndex].weeks[weekIndex].days[dayIndex];
    }
    // const newDay = _.cloneDeep(originDay);
    const newDay = { ..._.cloneDeep(originDay), formats: [] }; // Reset formats
    delete newDay._id;
    newDay.exercises.map((exercise) => {
      delete exercise._id;
    });
    newDay.warmups.map((warmup) => {
      delete warmup._id;
    });
    const nextFormat = getNextFormat();
    const nextTypeId = getNextTypeId();
    if (isPumpDay) {
      const updatedDays = [...days];
      if (!nextFormat) {
        newDay.typeId = nextTypeId;
        updatedDays.push(newDay);
      } else updatedDays.splice(dayIndex + 1, 0, newDay);
      updateDays(updatedDays);
    } else {
      const updatedMonths = [...months];
      if (!nextFormat) {
        newDay.typeId = nextTypeId;
        updatedMonths[monthIndex].weeks[weekIndex].days.push(newDay);
      } else updatedMonths[monthIndex].weeks[weekIndex].days.splice(dayIndex + 1, 0, newDay);
      updateMonths(updatedMonths);
    }
  };

  const deleteDay = (monthIndex: number, weekIndex: number, dayIndex: number) => {
    if (isPumpDay) {
      const updatedDays = [...days];
      const countSameType = updatedDays.filter((d) => d.typeId === day.typeId).length;
      updatedDays.splice(dayIndex, 1);
      updateDays(updatedDays);
      if (countSameType === 1) reassignDayTypeIds(day.typeId);
    } else {
      const updatedMonths = [...months];
      const countSameType = updatedMonths[monthIndex].weeks[weekIndex].days.filter(
        (d) => d.typeId === day.typeId
      ).length;
      updatedMonths[monthIndex].weeks[weekIndex].days.splice(dayIndex, 1);
      updateMonths(updatedMonths);
      if (countSameType === 1) reassignDayTypeIds(day.typeId);
    }
  };

  const reassignWarmupTypeIds = (deletedWarmupTypeId: number) => {
    if (isPumpDay) {
      const updatedDays = [...days];
      const warmups = updatedDays[dayIndex].warmups;
      warmups.forEach((warmup, index) => {
        if (warmup.typeId > deletedWarmupTypeId) warmup.typeId--;
      });
      updateDays(updatedDays);
    } else {
      const updatedMonths = [...months];
      const warmups = updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].warmups;
      warmups.forEach((warmup, index) => {
        if (warmup.typeId > deletedWarmupTypeId) warmup.typeId--;
      });
      updateMonths(updatedMonths);
    }
  };

  const reassignExerciseTypeIds = (deletedExerciseTypeId: number) => {
    if (isPumpDay) {
      const updatedDays = [...days];
      const exercises = updatedDays[dayIndex].exercises;
      exercises.forEach((exercise, index) => {
        if (exercise.typeId > deletedExerciseTypeId) exercise.typeId--;
      });
      updateDays(updatedDays);
    } else {
      const updatedMonths = [...months];
      const exercises = updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].exercises;
      exercises.forEach((exercise, index) => {
        if (exercise.typeId > deletedExerciseTypeId) exercise.typeId--;
      });
      updateMonths(updatedMonths);
    }
  };

  const updateDayTitle = (title) => {
    const updatedDay = { ...day, title };
    updateDay(monthIndex, weekIndex, dayIndex, updatedDay);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getNextFormat = () => {
    const allFormats = ['3', '4', '5'];
    const selectedFormats = checkedStates
      .map((isChecked, index) => (isChecked ? allFormats[index] : ''))
      .filter(Boolean);

    // Determine the next format that is not selected and not disabled
    const availableFormats = allFormats.filter((format, index) => {
      return !selectedFormats.includes(format);
    });

    return availableFormats.length > 0 && availableFormats.length < 3 ? availableFormats[0] : null;
  };

  const handleAddDayClick = () => {
    const nextTypeId = getNextTypeId();
    addDay(monthIndex, weekIndex, nextTypeId, []);
  };

  //Get available typeId's list in array for day order options
  const getTypeIdList = () => {
    if (isPumpDay) {
      return days.flatMap((day) => day.typeId);
    } else {
      return [...months][monthIndex].weeks[weekIndex].days.flatMap((day) => day.typeId);
    }
  };

  const getNextTypeId = () => {
    const typeIds = getTypeIdList();
    const maxTypeId = Math.max(0, ...typeIds);
    return maxTypeId + 1;
  };

  return (
    <>
      <div className={`p-4 bg-gray-300 rounded shadow-md mt-4 day-${dayIndex}`} style={{ backgroundColor: '#EAC0AB' }}>
        <div className="flex mb-2 justify-between items-center">
          <CustomTitle type={'DAY'} index={day.typeId || 1} customTitle={day.title} updateFunction={updateDayTitle} isPumpDay />
          <div className="flex gap-3">
            {isSevenDays ? (
              <Button
                variant="danger"
                name="duplicate day"
                startIcon={<DuplicateIcon className="h-4 w-4" />}
                onClick={() => duplicateDay(monthIndex, weekIndex, dayIndex)}
              />
            ) : null}
            <DeleteConfirmation deleteFunction={() => deleteDay(monthIndex, weekIndex, dayIndex)} name={'Day'} />
            <Button
              variant="danger"
              name="collapse"
              startIcon={isCollapsed ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronUpIcon className="h-4 w-4" />}
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
            week={monthIndex != null && weekIndex != null ? [...months][monthIndex]?.weeks[weekIndex] : null}
            day={day}
            states={checkedStates}
            updateStates={setCheckedStates}
            updateDay={updateDay}
            isPumpDay={isPumpDay}
            days={days}
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
              isPumpDay={isPumpDay}
              days={days}
              updateDays={updateDays}
            />
          ))}
          <div className="flex gap-6">
            <div className="flex-1">
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
                  isPumpDay={isPumpDay}
                  days={days}
                  updateDays={updateDays}
                />
              ))}
              {day.exercises.length === 0 ? (
                <Button
                  variant="danger"
                  onClick={() => addExercise(monthIndex, weekIndex, dayIndex, 1, [])}
                  className="mt-4"
                >
                  Add Exercise
                </Button>
              ) : null}
            </div>
            {day.circuits && (
              <div className="flex-1">
                {(day.circuits || []).map((circuit, circuitIndex) => (
                  <CircuitPlan
                    key={circuitIndex}
                    dayIndex={dayIndex}
                    circuitIndex={circuitIndex}
                    circuit={circuit}
                    days={days}
                    updateDays={updateDays}
                    addCircuit={addCircuit}
                  />
                ))}
                {day.circuits && day.circuits.length === 0 && (
                  <Button
                    variant="danger"
                    onClick={() => addCircuit(dayIndex, 1, [])}
                    startIcon={<PlusIcon className="h-4 w-4" />}
                    className="mt-4"
                  >
                    Add Circuit
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {(!isPumpDay && dayIndex === months[monthIndex].weeks[weekIndex].days.length - 1 && isSevenDays) ? (
        <Button
          variant="danger"
          onClick={handleAddDayClick}
          startIcon={<PlusIcon className="h-4 w-4" />}
          className="mt-4"
        >
          Add Day
        </Button>
      ) : null}
    </>
  );
};