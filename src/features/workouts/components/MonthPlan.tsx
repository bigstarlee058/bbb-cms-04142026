import React, { useCallback } from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/Elements';
import { MonthDetail } from './MonthDetail';
import { CustomTitle } from './CustomTitle';
import { v4 as uuid } from 'uuid';

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
  setCurrentPage?: (page: number) => void;
  addMonth: () => void;
  updateMonths: (months: Month[]) => void;
  measure: () => void;
  toggleCollapse: () => void;
  isCollapsed: boolean;
  startIndex: number;
  scrollToMonth?: (monthIndex: number) => void;
  currentPage: number;
  perPage: number;
  expandedWeeks: { [key: string]: boolean };
  setExpandedWeeks: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
}
export const MonthPlan = React.memo(
  React.forwardRef<HTMLDivElement, Props>(({
    monthIndex, month, months, setCurrentPage, startIndex, currentPage,
    perPage, addMonth, scrollToMonth, updateMonths, measure,
    toggleCollapse, isCollapsed, setExpandedWeeks, expandedWeeks
  }, ref) => {
    const realMonthIndex = startIndex + monthIndex;

    const addWeek = useCallback(() => {
      const newWeek: Week = { title: '', description: '', vimeoId: '', thumbnail: '', restdayId: '', days: [], localId: uuid(), };
      const updatedMonths = [...months];
      updatedMonths[realMonthIndex].weeks.push(newWeek);
      updateMonths(updatedMonths);
    }, [months, realMonthIndex, updateMonths]);

    useEffect(() => {
      if (measure) measure();
    }, [isCollapsed, measure]);

    const duplicateMonth = useCallback(() => {
      const originMonth = months[realMonthIndex];
      if (!originMonth) return;
      const newMonth = _.cloneDeep(originMonth);
      delete newMonth._id;
      newMonth.localId = uuid();
      newMonth.weeks.forEach((week) => {
        delete week._id;
        week.localId = uuid();

        week.days.forEach((day) => {
          delete day._id;
          day.localId = uuid();

          day.exercises?.forEach((ex) => {
            delete ex._id;
            ex.localId = uuid();
          });

          day.warmups?.forEach((w) => {
            delete w._id;
            w.localId = uuid();
          });
        });
      });

      const updatedMonths = [...months];
      updatedMonths.splice(realMonthIndex + 1, 0, newMonth);
      updateMonths(updatedMonths);

      const newMonthIndex = realMonthIndex + 1;
      const newPage = Math.floor(newMonthIndex / 6) + 1;

      if (setCurrentPage) setCurrentPage(newPage);

      requestAnimationFrame(() => {
        measure?.();
        scrollToMonth?.(newMonthIndex);
      });
    }, [months, realMonthIndex, updateMonths, setCurrentPage, measure, scrollToMonth]);

    const deleteMonth = useCallback(() => {
      const updatedMonths = [...months];
      updatedMonths.splice(monthIndex, 1);

      const lastPage = Math.ceil(updatedMonths.length / perPage) || 1;
      const newPage = currentPage > lastPage ? lastPage : currentPage;

      updateMonths(updatedMonths);
      setCurrentPage(newPage);
    }, [months, monthIndex, updateMonths, currentPage, setCurrentPage, perPage]);
    const updateMonth = useCallback((monthIndex: number, updatedMonth: Month) => {
      const updatedMonths = [...months];
      updatedMonths[monthIndex] = updatedMonth;
      updateMonths(updatedMonths);
    }, [months, updateMonths]);

    const updateMonthTitle = (title) => {
      const updatedMonth = { ...month, title };
      updateMonth(realMonthIndex, updatedMonth);
    };
    if (!months || !months[realMonthIndex]) {
      return (
        <div
          key={monthIndex}
          className="my-4 border p-4 rounded bg-white shadow"
          style={{ backgroundColor: '#E8E8E8', minHeight: '50px' }}
        >
          <div className="text-gray-500">No month data</div>
        </div>
      );
    }

    const isFourWeeksOrLess = month.weeks.length <= 3;
    return (
      <div
      ref={ref}
        key={month.localId}
        className={`my-1 border p-2 rounded bg-white shadow month-${month.localId}`}
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
              onClick={() => duplicateMonth()}
            />
            <DeleteConfirmation
              deleteFunction={deleteMonth}
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
          {!isCollapsed && (
            <MonthDetail
              monthIndex={realMonthIndex}
              month={month}
              updateMonth={updateMonth}
            />
          )}
          {month.weeks.length < 1 ? (
            <Button
              variant="danger"
              onClick={() => addWeek()}
              startIcon={<PlusIcon className="h-4 w-4" />}
            >
              Add Week
            </Button>
          ) : null}
          {month.weeks.map((week, weekIndex) => (
            <WeekPlan
              key={`${month.localId}-${week.localId}`}
              monthIndex={realMonthIndex}
              weekIndex={weekIndex}
              week={week}
              addWeek={addWeek}
              months={months}
              updateMonths={updateMonths}
              isFourWeeksOrLess={isFourWeeksOrLess}
              expandedWeeks={expandedWeeks}
              setExpandedWeeks={setExpandedWeeks}
              monthLocalId={month.localId}
            />

          ))}

        </div>
      </div>
    );
  }));