import { Button } from '@/components/Elements';
import { PlusIcon, TrashIcon } from '@heroicons/react/outline';
import { Field } from './custom';
import { ExercisePlan } from './ExercisePlan';
import { DayExercise } from '@/types';

export const CircuitPlan = ({ circuit, dayIndex, circuitIndex, days, updateDays }) => {
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

  const handleChange = (key: string, val: string) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].circuits[circuitIndex][key] = val;
    updateDays(updatedDays);
  };

  const onDeleteCircuit = () => {
    const updatedDays = [...days];
    updatedDays[dayIndex].circuits.splice(circuitIndex, 1);
    updateDays(updatedDays);
  };

  return (
    <div className="p-4 bg-gray-200 rounded shadow-md mt-4">
      <div className="flex justify-between items-end">
        <label className="fieldLabel">Circuit</label>
        <Button variant="danger" startIcon={<TrashIcon className="h-4 w-4" />} onClick={onDeleteCircuit}></Button>
      </div>
      <Field label="Round" type="number" name="round" value={circuit.round} onChange={handleChange} />
      {circuit.circuitExercises.length === 0 && (
        <Button
          variant="danger"
          onClick={() => addCircuitExercise(0, 0, dayIndex, 1, [])}
          startIcon={<PlusIcon className="h-4 w-4" />}
          className="mt-4"
        >
          Add Circuit Exercise
        </Button>
      )}
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
  );
};
