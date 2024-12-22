import { useState } from 'react';

import _ from 'lodash';
import { DayPlan } from '../workouts/components/DayPlan';
import { Button } from '@/components/Elements';
import { PlusIcon } from '@heroicons/react/outline';
import { Day } from '@/types';

export const PumpDayList = () => {
  const [days, setDays] = useState([]);

  const addDay = (newTypeId: number, newFormats: string[]) => {
    const newDay: Day = {
      typeId: newTypeId,
      title: '',
      description: '',
      vimeoId: '',
      thumbnail: null,
      formats: newFormats,

      warmups: [],
      exercises: [],
      circuits: [],
    };
    setDays((prev) => {
      return [...prev, newDay];
    });
  };

  const reassignDayTypeIds = (deletedDayTypeId: number) => {
    setDays((prev) => {
      const updatedDays = [...prev];
      updatedDays.forEach((day, index) => {
        if (day.typeId > deletedDayTypeId) day.typeId--;
      });
      return updatedDays;
    });
  };

  return (
    <>
      {days.length < 1 ? (
        <Button variant="danger" onClick={() => addDay(1, [])} startIcon={<PlusIcon className="h-4 w-4" />}>
          Add Day
        </Button>
      ) : null}
      {days.map((day, dayIndex) => (
        <DayPlan
          key={dayIndex}
          monthIndex={0}
          weekIndex={0}
          dayIndex={dayIndex}
          day={day}
          addDay={addDay}
          reassignDayTypeIds={reassignDayTypeIds}
          months={[]}
          updateMonths={() => {}}
          isSevenDays
          isWeekCollapsed={false}
          isPumpDay
          updateDays={(val) => setDays(val)}
          days={days}
        />
      ))}
    </>
  );
};
