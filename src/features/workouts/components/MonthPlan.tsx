import React, { useCallback } from 'react';
import { useState } from 'react';
import { Button } from '@/components/Elements';
import { MonthDetail } from './MonthDetail';
import { CustomTitle } from './CustomTitle';
import {
  DuplicateIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/outline';
import { WeekPlan } from './WeekPlan';
import { Month, Week } from '@/types';
import { DeleteConfirmation } from './custom/DeleteConfirmation';
import _ from 'lodash';

interface Props {
  monthIndex: number;
  month: Month;
  months: Month[];
  currentPage: number;
  addMonth: () => void;
  updateMonths: (months: Month[]) => void;
}

export const MonthPlan = React.memo(({ monthIndex, month, months, currentPage, addMonth, updateMonths } : Props) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const realMonthIndex = (currentPage - 1) * 5 + monthIndex;

  const addWeek = useCallback((monthIndex: number) => {
    const newWeek: Week = {
      title: '',
      description: '',
      vimeoId: '',
      thumbnail: '',
      restdayId: '',
      
      days: [],
    };
    const updatedMonths = [...months];
    updatedMonths[monthIndex].weeks.push(newWeek);
    updateMonths(updatedMonths);
  },[months, updateMonths]);

  const duplicateMonth = useCallback((monthIndex: number) => {
    const originMonth = months[monthIndex];
    const newMonth = _.cloneDeep(originMonth);
    delete newMonth._id;
    newMonth.weeks.map(week => {
      delete week._id;
      week.days.map(day => {
        delete day._id;
        day.exercises.map(exercise => {
          delete exercise._id;
        })
        day.warmups.map(warmup => {
          delete warmup._id;
        })
      })
    })
    const updatedMonths = [...months];
    updatedMonths.splice(monthIndex + 1, 0, newMonth);
    updateMonths(updatedMonths);
  },[months, updateMonths]);

  const deleteMonth = useCallback((monthIndex: number) => {
    const updatedMonths = [...months];
    updatedMonths.splice(monthIndex, 1);
    updateMonths(updatedMonths);
  },[months, updateMonths]);

  const updateMonth = useCallback((monthIndex: number, updatedMonth: Month) => {
    const updatedMonths = [...months];
    updatedMonths[monthIndex] = updatedMonth;
    updateMonths(updatedMonths);
  },[months, updateMonths]);

  const updateMonthTitle = (title) => {
    const updatedMonth = { ...month, title };
    updateMonth(realMonthIndex, updatedMonth);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if(!months[realMonthIndex])
    return null;

  const isFourWeeksOrLess = month.weeks.length <= 3;
  return (
    <div
      key={monthIndex}
      className={`my-4 border p-4 rounded bg-white shadow month-${monthIndex}`}
      style={{ backgroundColor: '#E8E8E8' }}
    >
      <div className="flex justify-between items-center mb-2 gap-3">
        <CustomTitle
          type={'MONTH'}
          index={realMonthIndex + 1}
          customTitle={month.title}
          updateFunction={updateMonthTitle}
        />
        <div className="flex gap-4">
          <Button
            variant="danger"
            name="add month"
            startIcon={<PlusIcon className="h-6 w-4" />}
            onClick={addMonth}
          />
          <Button
            variant="danger"
            name="duplicate month"
            startIcon={<DuplicateIcon className="h-4 w-4" />}
            onClick={() => duplicateMonth(realMonthIndex)}
          />
          <DeleteConfirmation
            deleteFunction={() => deleteMonth(realMonthIndex)}
            name={'Month'}
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
        <MonthDetail monthIndex={realMonthIndex} month={month} updateMonth={updateMonth} />
        {month.weeks.length < 1 ? (
          <Button
            variant="danger"
            onClick={() => addWeek(realMonthIndex)}
            startIcon={<PlusIcon className="h-4 w-4" />}
          >
            Add Week
          </Button>
        ) : null}
        {month.weeks.map((week, weekIndex) => (
          <WeekPlan
            key={weekIndex}
            monthIndex={realMonthIndex}
            weekIndex={weekIndex}
            week={week}
            addWeek={addWeek}
            months={months}
            updateMonths={updateMonths}
            isFourWeeksOrLess={isFourWeeksOrLess} 
          />
        ))}
      </div>
    </div>
  );
});