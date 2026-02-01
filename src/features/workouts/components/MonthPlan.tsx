import React, { useCallback, useEffect } from 'react';
import { Button } from '@/components/Elements';
import { MonthDetail } from './MonthDetail';
import { CustomTitle } from './CustomTitle';
import { v4 as uuid } from 'uuid';
import { useLanguageStore } from '@/stores/languages';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { useWorkoutContext } from '../WorkoutContext';

import {
  DuplicateIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/outline';
import { WeekPlan } from './WeekPlan';
import { Month, Week } from '@/types';
import { DeleteConfirmation } from './custom/DeleteConfirmation';

interface Props {
  monthIndex: number;
  month: Month;
  months: Month[];
  setCurrentPage?: (page: number) => void;
  addMonth: () => void;
  updateMonths: (months: Month[], options?: { syncPage?: boolean; skipMeasure?: boolean }) => void;
  measure: () => void;
  toggleCollapse: () => void;
  isCollapsed: boolean;
  startIndex: number;
  scrollToMonth?: (monthIndex: number) => void;
  currentPage: number;
  perPage: number;
  expandedWeeks: { [key: string]: boolean };
  setExpandedWeeks: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  expandedDays: { [key: string]: boolean };
  setExpandedDays: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  scrollToWeek?: (monthIndex: number, weekLocalId: string) => void;
  onScrollToDay?: (monthIndex: number, weekIndex: number, dayLocalId: string, options?: { expandIfCollapsed?: boolean }) => void;
  onDuplicateMonth?: (realMonthIndex: number) => void;
}

export const MonthPlan = React.memo(
  React.forwardRef<HTMLDivElement, Props>(({
    monthIndex, month, months, setCurrentPage, startIndex, currentPage,
    perPage, addMonth, scrollToMonth, updateMonths, measure,
    toggleCollapse, isCollapsed, setExpandedWeeks, expandedWeeks, expandedDays, setExpandedDays,
    scrollToWeek, onScrollToDay,
    onDuplicateMonth
  }, ref) => {
    const realMonthIndex = startIndex + monthIndex;
    const languages = useLanguageStore((state) => state.languages);
    const { selectedLanguagesByMonth, handleLanguageToggleForMonth, setSelectedLanguagesForMonth } = useWorkoutContext();
    const selectedLanguages = selectedLanguagesByMonth[month.localId] || [];

    useEffect(() => {
      if (month && languages.length > 0) {
        const existingLangs = new Set<string>();

        const collectTranslationKeys = (obj: any) => {
          if (!obj || typeof obj !== 'object') return;

          Object.keys(obj).forEach(key => {
            if (key.endsWith('Translations') && obj[key] && typeof obj[key] === 'object') {
              Object.keys(obj[key]).forEach(langKey => {
                if (obj[key][langKey]) {
                  existingLangs.add(langKey);
                }
              });
            } else if (Array.isArray(obj[key])) {
              obj[key].forEach(item => collectTranslationKeys(item));
            } else if (typeof obj[key] === 'object' && obj[key] !== null && !(obj[key] instanceof File)) {
              collectTranslationKeys(obj[key]);
            }
          });
        };

        collectTranslationKeys(month);

        const availableLangs = Array.from(existingLangs).filter(lang =>
          languages.some(l => l.key === lang && l.inUse)
        );

        if (availableLangs.length > 0 && selectedLanguages.length === 0) {
          setSelectedLanguagesForMonth(month.localId, availableLangs);
        }
      }
    }, [month, languages]);

    const addWeek = useCallback(() => {
      const newWeek: Week = { title: '', description: '', vimeoId: '', thumbnail: '', restdayId: '', days: [], localId: uuid(), };
      const updatedMonths = [...months];
      updatedMonths[realMonthIndex].weeks.push(newWeek);
      updateMonths(updatedMonths);
    }, [months, realMonthIndex, updateMonths]);
    useEffect(() => {
      requestAnimationFrame(() => {
        measure?.();
      });
    }, [isCollapsed, measure]);
    const deleteMonth = useCallback(() => {
      const updatedMonths = [...months];
      updatedMonths.splice(realMonthIndex, 1);
      const lastPage = Math.ceil(updatedMonths.length / perPage) || 1;
      const newPage = currentPage > lastPage ? lastPage : currentPage;

      updateMonths(updatedMonths);
      setCurrentPage(newPage);
    }, [months, monthIndex, updateMonths, currentPage, setCurrentPage, perPage]);
    const updateMonthTitle = (key, value) => {
      const keys = key.split('.');
      let updatedMonth = { ...month };

      if (keys.length === 1) {
        updatedMonth = { ...month, [key]: value };
      } else {
        updatedMonth = {
          ...month,
          [keys[0]]: { ...month[keys[0]], [keys[1]]: value }
        };
      }
      updateMonth(realMonthIndex, updatedMonth);
    };

    const updateMonth = useCallback((monthIndex: number, updatedMonth: Month) => {
      const updatedMonths = [...months];
      updatedMonths[monthIndex] = updatedMonth;
      updateMonths(updatedMonths, { skipMeasure: true });
    }, [months, updateMonths]);
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
        className={`border p-2 rounded bg-white shadow month-${month.localId} mb-4`}
        style={{ backgroundColor: '#E8E8E8' }}
      >
        <div className="flex justify-center mb-2">
          <LanguageSelector
            selectedLanguages={selectedLanguages}
            onToggle={(langKey) => handleLanguageToggleForMonth(month.localId, langKey)}
            labelPosition={'inline'}
          />
        </div>
        <div className="flex justify-between items-center mb-2 gap-3">
          <CustomTitle
            type={'MONTH'}
            index={realMonthIndex + 1}
            customTitle={month.title}
            titleTranslations={month.titleTranslations || {}}
            selectedLanguages={selectedLanguages}
            updateFunction={updateMonthTitle}
          />
          <div className="flex gap-4 mt-4">
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
              onClick={() => onDuplicateMonth?.(realMonthIndex)}
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
              selectedLanguages={selectedLanguages}
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
              expandedDays={expandedDays}
              setExpandedDays={setExpandedDays}
              monthLocalId={month.localId}
              onScrollToWeek={(monthIdx, wkIdx) => {
                const weekLocalId = month.weeks[wkIdx]?.localId;
                if (weekLocalId && scrollToWeek) scrollToWeek(monthIdx, weekLocalId);
              }}
              onScrollToMonth={(monthIdx) => scrollToMonth?.(monthIdx)}
              scrollToWeek={scrollToWeek}
              onScrollToDay={onScrollToDay}
              selectedLanguages={selectedLanguages}
            />
          ))}
        </div>
      </div>
    );
  }));