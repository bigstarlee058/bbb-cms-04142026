import React, { useMemo, useState } from 'react';
import { Button } from '@/components/Elements';
import { DuplicateIcon, PlusIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';
import { CustomTitle } from './CustomTitle';
import { WeekDetail } from './WeekDetail';
import { DayPlan } from './DayPlan';
import { Day, Week, Month } from '@/types';
import { DeleteConfirmation } from './custom/DeleteConfirmation';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
interface Props {
  monthIndex: number;
  weekIndex: number;
  week: Week;
  addWeek: (monthIndex: number) => void;
  months: Month[];
  updateMonths: (months: Month[], options?: { skipMeasure?: boolean }) => void;
  isFourWeeksOrLess: boolean;
  expandedWeeks: { [key: string]: boolean };
  setExpandedWeeks: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  expandedDays: { [key: string]: boolean };
  setExpandedDays: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  monthLocalId: string;
  onScrollToWeek?: (monthIndex: number, weekIndex: number) => void;
  onScrollToMonth?: (monthIndex: number) => void;
  onScrollToDay?: (monthIndex: number, weekIndex: number, dayLocalId: string, options?: { expandIfCollapsed?: boolean }) => void;
  scrollToWeek?: (monthIndex: number, weekLocalId: string) => void;
}


const showAddDay = (days) => {
  let count = 0;
  days.forEach((day) => {
    count = count + day.formats.length;
  });
  return count < 12; // 3 + 4 + 5 = 12 days split
}

const WeekPlanComponent = ({
  monthIndex,
  weekIndex,
  week,
  addWeek,
  months,
  updateMonths,
  isFourWeeksOrLess,
  expandedWeeks,
  setExpandedWeeks,
  expandedDays, setExpandedDays,
  monthLocalId,
  onScrollToWeek,
  onScrollToMonth,
  onScrollToDay,
  scrollToWeek,
}: Props) => {
  const weekKey = `${monthLocalId}-${week.localId}`;
  const isCollapsed = !(expandedWeeks?.[weekKey] ?? false);

  const toggleCollapse = () => {
  const weekKey = `${monthLocalId}-${week.localId}`;
  const isCurrentlyExpanded = expandedWeeks?.[weekKey] === true;

  setExpandedWeeks((prev) => ({
    ...prev,
    [weekKey]: !prev?.[weekKey],
  }));

  if (isCurrentlyExpanded) {
    requestAnimationFrame(() => {
      if (weekIndex > 0) {
        onScrollToWeek?.(monthIndex, weekIndex - 1);
      } else {
        onScrollToMonth?.(monthIndex);
      }
    });
  }
};
  if (!months[monthIndex]?.weeks[weekIndex]) return null;

  const addDay = (monthIndex: number, weekIndex: number, newTypeId: number, newFormats: string[]) => {
    const updatedMonths = [...months];
    const newDay: Day = {
      typeId: newTypeId,
      title: '',
      description: '',
      vimeoId: '',
      vimeoIdTwo: '',
      vimeoIdThree: '',
      thumbnail: null,
      thumbnailOne: null,
      thumbnailTwo: null,
      thumbnailThree: null,
      formats: newFormats,
      localId: uuid(),
      warmups: [],
      exercises: []
    };
    updatedMonths[monthIndex].weeks[weekIndex].days.push(newDay);
    updateMonths(updatedMonths, { skipMeasure: true })
  };

  const duplicateWeek = (monthIndex: number, weekIndex: number) => {
    const originWeek = months[monthIndex].weeks[weekIndex];
    const newWeek = JSON.parse(JSON.stringify(originWeek));
    newWeek.localId = uuid();
    newWeek.days.forEach((day: any) => {
      day.localId = uuid();
      day.exercises.forEach((ex: any) => {
        ex.localId = uuid();
      });
      day.warmups.forEach((w: any) => {
        w.localId = uuid();
      });
    });

    const updatedMonths = [...months];
    updatedMonths[monthIndex].weeks.splice(weekIndex + 1, 0, newWeek);
    updateMonths(updatedMonths, { skipMeasure: true })
  };


  const updateWeek = (monthIndex: number, weekIndex: number, updatedWeek: Week) => {
    const updatedMonths = [...months];
    updatedMonths[monthIndex].weeks[weekIndex] = updatedWeek;
    updateMonths(updatedMonths, { skipMeasure: true })
  };

  const deleteWeek = (monthIndex: number, weekIndex: number) => {
    const updatedMonths = [...months];
    updatedMonths[monthIndex].weeks.splice(weekIndex, 1);
    updateMonths(updatedMonths, { skipMeasure: true })
  };

  const reassignDayTypeIds = (deletedDayTypeId: number) => {
    const updatedMonths = [...months];
    const days = updatedMonths[monthIndex].weeks[weekIndex].days;
    days.forEach((day, _) => {
      if (day.typeId > deletedDayTypeId) day.typeId--;
    });
    updateMonths(updatedMonths, { skipMeasure: true })
  };

  const updateWeekTitle = (title) => {
    const updatedWeek = { ...week, title };
    updateWeek(monthIndex, weekIndex, updatedWeek);
  };
  const isSevenDays = showAddDay(week.days);
  return (
    <div className={`my-4 border p-4 rounded shadow week-${week.localId}`} style={{ backgroundColor: '#CDBDDC' }}>
      <div className="flex mb-2 justify-between items-center">
        <CustomTitle type={'WEEK'} index={weekIndex + 1} customTitle={week.title} updateFunction={updateWeekTitle} />
        <div className="flex gap-3">
          {isFourWeeksOrLess ? (
            <Button
              variant="danger"
              name="add week"
              startIcon={<PlusIcon className="h-4 w-4" />}
              onClick={() => addWeek(monthIndex)}
            />
          ) : null}
          {isFourWeeksOrLess ? (
            <Button
              variant="danger"
              name="duplicate week"
              startIcon={<DuplicateIcon className="h-4 w-4" />}
              onClick={() => duplicateWeek(monthIndex, weekIndex)}
            />
          ) : null}
          <DeleteConfirmation deleteFunction={() => deleteWeek(monthIndex, weekIndex)} name={'Week'} />
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
        {!isCollapsed && (
          <WeekDetail
            monthIndex={monthIndex}
            weekIndex={weekIndex}
            week={week}
            updateWeek={updateWeek}
          />
        )}

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
            key={day.localId}
            monthIndex={monthIndex}
            weekIndex={weekIndex}
            dayIndex={dayIndex}
            day={day}
            addDay={addDay}
            reassignDayTypeIds={reassignDayTypeIds}
            months={months}
            updateMonths={updateMonths}
            setExpandedDays={setExpandedDays}
            expandedDays={expandedDays}
            isSevenDays={isSevenDays}
            isWeekCollapsed={isCollapsed}
            onScrollToDay={onScrollToDay}
            scrollToWeek={scrollToWeek}
          />
        ))}
      </div>
    </div>
  );
};
export const WeekPlan = React.memo(WeekPlanComponent);
