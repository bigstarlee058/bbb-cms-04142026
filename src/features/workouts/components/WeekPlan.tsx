import { useState } from 'react';
import { Button } from '@/components/Elements';
import {
  DuplicateIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/outline';
import { CustomTitle } from './CustomTitle';
import { WeekDetail } from './WeekDetail';
import { DayPlan } from './DayPlan';
import { Day, Week } from '@/types';
import { DeleteConfirmation } from './custom/DeleteConfirmation';

import _ from 'lodash';

export const WeekPlan = ({ monthIndex, weekIndex, week, addWeek, months, updateMonths, isFourWeeksOrLess }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);


  if(!months[monthIndex]?.weeks[weekIndex])
    return null;

  const addDay = (monthIndex: number, weekIndex: number, newTypeId: number, newFormats: string[]) => {
    const updatedMonths = [...months];
    const newDay: Day = {
      typeId: newTypeId,
      title: '',
      description: '',
      vimeoId: '',
      thumbnail: null,
      formats: newFormats,

      warmups: [],
      exercises: [],
    };
    updatedMonths[monthIndex].weeks[weekIndex].days.push(newDay);
    updateMonths(updatedMonths);
  };

  const duplicateWeek = (monthIndex: number, weekIndex: number) => {
    const originWeek = months[monthIndex].weeks[weekIndex];
    const newWeek = _.cloneDeep(originWeek);
    delete newWeek._id;
    newWeek.days.map(day => {
      delete day._id;
      day.exercises.map(exercise => {
        delete exercise._id;
      })
      day.warmups.map(warmup => {
        delete warmup._id;
      })
    })
    const updatedMonths = [...months];
    updatedMonths[monthIndex].weeks.splice(weekIndex + 1, 0, newWeek);
    updateMonths(updatedMonths);
  };

  const updateWeek = (monthIndex: number, weekIndex: number, updatedWeek: Week) => {
    const updatedMonths = [...months];
    updatedMonths[monthIndex].weeks[weekIndex] = updatedWeek;
    updateMonths(updatedMonths);
  };

  const deleteWeek = (monthIndex: number, weekIndex: number) => {
    const updatedMonths = [...months];
    updatedMonths[monthIndex].weeks.splice(weekIndex, 1);
    updateMonths(updatedMonths);
  };

  const reassignDayTypeIds = (deletedDayTypeId: number) => {
    const updatedMonths = [...months];
    const days = updatedMonths[monthIndex].weeks[weekIndex].days;
    days.forEach((day, index) => {
      if (day.typeId > deletedDayTypeId) day.typeId--;
    });
    updateMonths(updatedMonths);
  };

  const updateWeekTitle = (title) => {
    const updatedWeek = { ...week, title };
    updateWeek(monthIndex, weekIndex, updatedWeek);
  };

  const updateWeekRestday = (restdayId) => {
    const updatedWeek = { ...week, restdayId };
    updateWeek(monthIndex, weekIndex, updatedWeek);
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isSevenDays = week.days.length <= 6;
  return (
    <div
      className={`my-4 border p-4 rounded shadow week-${weekIndex}`}
      style={{ backgroundColor: '#CDBDDC' }}
    >
      <div className="flex mb-2 justify-between items-center">
        <CustomTitle
          type={'WEEK'}
          index={weekIndex + 1}
          customTitle={week.title}
          updateFunction={updateWeekTitle}
        />
        <div className="flex gap-3">
          { isFourWeeksOrLess ? (<Button
            variant="danger"
            name="add week"
            startIcon={<PlusIcon className="h-4 w-4" />}
            onClick={() => addWeek(monthIndex)}
          />) : null }
          { isFourWeeksOrLess ? (<Button
            variant="danger"
            name="duplicate week"
            startIcon={<DuplicateIcon className="h-4 w-4" />}
            onClick={() => duplicateWeek(monthIndex, weekIndex)}
          />): null }
          <DeleteConfirmation
            deleteFunction={() => deleteWeek(monthIndex, weekIndex)}
            name={'Week'}
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
        <WeekDetail
          monthIndex={monthIndex}
          weekIndex={weekIndex}
          week={week}
          updateWeek={updateWeek}
        />
        {week.days.length < 1 ? (
          <Button
            variant="danger"
            onClick={() => addDay(monthIndex, weekIndex, 1, [])}
            startIcon={<PlusIcon className="h-4 w-4" />}
          >
            Add Day
          </Button>
        ) : null}
        {week.days.map((day, dayIndex) => (
          <DayPlan
            key={dayIndex}
            monthIndex={monthIndex}
            weekIndex={weekIndex}
            dayIndex={dayIndex}
            day={day}
            addDay={addDay}
            reassignDayTypeIds={reassignDayTypeIds}
            months={months}
            updateMonths={updateMonths}
            isSevenDays={isSevenDays}
            isWeekCollapsed={isCollapsed}
          />
        ))}
      </div>
    </div>
  );
};
