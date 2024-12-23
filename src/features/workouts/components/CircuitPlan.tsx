import { Button } from '@/components/Elements';
import { PlusIcon, TrashIcon } from '@heroicons/react/outline';
import { Field } from './custom';
import { ExercisePlan } from './ExercisePlan';
import { DayExercise } from '@/types';
import { useEffect, useState } from 'react';

export const CircuitPlan = ({ circuit, dayIndex, circuitIndex, days, updateDays, addCircuit }) => {
  const [checkedStates, setCheckedStates] = useState([false, false, false]);
  useEffect(() => {
    if (circuit.formats) {
      const newCheckedStates = ['A', 'B', 'C'].map((format) => circuit.formats.includes(format));
      setCheckedStates(newCheckedStates);
    }
  }, [circuit.formats]);

  const addCircuitExercise = (
    _monthIndex: number,
    _weekIndex: number,
    dayIndex: number,
    newTypeId: number,
    newFormats: string[]
  ) => {
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
    updatedDays[dayIndex].circuits[circuitIndex].circuitExercises.push(newExercise);
    updateDays(updatedDays);
  };

  const reassignCircuitExerciseTypeIds = (deletedExerciseTypeId: number) => {
    const updatedDays = [...days];
    const exercises = updatedDays[dayIndex].circuits[circuitIndex].circuitExercises;
    exercises.forEach((exercise, index) => {
      if (exercise.typeId > deletedExerciseTypeId) exercise.typeId--;
    });
    updateDays(updatedDays);
  };

  const handleChange = (key: string, val: string | string[]) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].circuits[circuitIndex][key] = val;
    updateDays(updatedDays);
  };

  const onDeleteCircuit = () => {
    const updatedDays = [...days];
    updatedDays[dayIndex].circuits.splice(circuitIndex, 1);
    updateDays(updatedDays);
  };

  // Check if a format is disabled in other exercises with the same typeId
  const isDisabled = (index) => {
    const format = ['A', 'B', 'C'][index];
    return days[dayIndex].circuits
      .filter((e) => e !== circuit && e.typeId === circuit.typeId)
      .some((e) => e.formats?.includes(format));
  };

  const handleCheckboxClick = (index) => {
    const newCheckedStates = checkedStates.map((state, i) => (i === index ? !state : state));
    setCheckedStates(newCheckedStates);

    const newFormats = newCheckedStates.reduce((formats, state, i) => {
      if (state) formats.push(['A', 'B', 'C'][i]);
      return formats;
    }, []);

    handleChange('formats', newFormats);
  };

  const handleAddCircuitClick = () => {
    const nextFormat = getNextFormat();

    if (nextFormat) {
      addCircuit(dayIndex, circuit.typeId, [nextFormat]);
    } else {
      const nextTypeId = getNextTypeId();
      addCircuit(dayIndex, nextTypeId, []);
    }
  };

  const getAddCircuitButtonTitle = () => {
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
      return `Add Circuit ${nextTypeId}`;
    }

    const nextFormat = availableFormats.length > 0 ? availableFormats[0] : null;

    if (nextFormat) {
      // There are available formats, show the current type ID with the next available format
      return `Add Circuit ${circuit.typeId}${nextFormat}`;
    } else {
      // All formats are selected or disabled, show the next type ID
      const nextTypeId = getNextTypeId();
      return `Add Circuit ${nextTypeId}`;
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

  const getNextTypeId = () => {
    const typeIds = [...days][dayIndex].circuits.flatMap((ex) => ex.typeId);
    const maxTypeId = Math.max(0, ...typeIds);
    return maxTypeId + 1;
  };

  return (
    <>
      <div className="p-4 bg-gray-200 rounded shadow-md mt-4">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-5">
            <label className="fieldLabel">Circuit</label>
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
          </div>
          <Button variant="danger" startIcon={<TrashIcon className="h-4 w-4" />} onClick={onDeleteCircuit}></Button>
        </div>
        <Field label="Round" type="number" name="round" value={circuit.round} onChange={handleChange} />
        {circuit.circuitExercises.map((exercise, exerciseIndex) => (
          <ExercisePlan
            key={exerciseIndex}
            monthIndex={0}
            weekIndex={0}
            dayIndex={dayIndex}
            circuitIndex={circuitIndex}
            exerciseIndex={exerciseIndex}
            exercise={exercise}
            addExercise={addCircuitExercise}
            reassignExerciseTypeIds={reassignCircuitExerciseTypeIds}
            months={[]}
            updateMonths={() => {}}
            isPumpDay
            days={days}
            updateDays={updateDays}
            isCircuit
          />
        ))}
      </div>
      {circuitIndex === days[dayIndex].circuits.length - 1 && (
        <Button
          variant="danger"
          onClick={handleAddCircuitClick}
          startIcon={<PlusIcon className="h-4 w-4" />}
          className="mt-4"
        >
          {getAddCircuitButtonTitle()}
        </Button>
      )}
    </>
  );
};
