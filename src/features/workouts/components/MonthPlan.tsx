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
import { DeleteConfirmation } from './DeleteConfirmation';
import _ from 'lodash';

export const MonthPlan = ({ monthIndex, month, addMonth, currentPage, months, updateMonths }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const realMonthIndex = (currentPage - 1) * 5 + monthIndex;
  if(!months[realMonthIndex])
    return null;

  const addWeek = (monthIndex: number) => {
    const newWeek: Week = {
      title: '',
      description: '',
      vimeoId: '',
      thumbnail: '',
      startDate: null,
      endDate: null,

      days: [],
    };
    const updatedMonths = [...months];
    updatedMonths[monthIndex].weeks.push(newWeek);
    updateMonths(updatedMonths);
  };

  const duplicateMonth = (monthIndex: number) => {
    const originMonth = months[monthIndex];
    const newMonth = _.cloneDeep(originMonth);
    newMonth._id = '';
    const updatedMonths = [...months];
    updatedMonths.splice(monthIndex + 1, 0, newMonth);
    updateMonths(updatedMonths);
  };

  const deleteMonth = (monthIndex: number) => {
    const updatedMonths = [...months];
    updatedMonths.splice(monthIndex, 1);
    updateMonths(updatedMonths);
  };

  const updateMonth = (monthIndex: number, updatedMonth: Month) => {
    const updatedMonths = [...months];
    updatedMonths[monthIndex] = updatedMonth;
    updateMonths(updatedMonths);
  };

  const updateMonthTitle = (title) => {
    const updatedMonth = { ...month, title };
    updateMonth(realMonthIndex, updatedMonth);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
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
          />
        ))}
      </div>
    </div>
  );
};

export default MonthPlan;
