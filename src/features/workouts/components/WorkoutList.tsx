import { useState, useRef, useCallback, useMemo } from 'react';
import { Button, Spinner } from '@/components/Elements';
import { PlusIcon } from '@heroicons/react/outline';
import { Navbar } from './Navbar';
import { MonthPlan } from './MonthPlan';
import { useQuery } from 'react-query';
import { fetchWorkouts } from '@/features/workouts/api';
import { useVirtualizer } from '@tanstack/react-virtual';
import Pagination from '@/components/Elements/Pagination';
import { Month } from '@/types';
import { useWorkoutContext } from '../WorkoutContext';
import { v4 as uuid } from 'uuid';

export const WorkoutList = () => {
  const [allMonths, setAllMonths] = useState([]);
  const [loadingMonths, setLoadingMonths] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);

  const filters = useMemo(() => ({ perPage: 6, page: currentPage }), [currentPage]);
  const parentRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<{ [key: string]: boolean }>({});
  const [expandedWeeks, setExpandedWeeks] = useState<{ [key: string]: boolean }>({});
  const paginatedMonths = useMemo(() => {
    const startIndex = (currentPage - 1) * filters.perPage;
    const endIndex = startIndex + filters.perPage;
    return allMonths.slice(startIndex, endIndex);
  }, [allMonths, currentPage, filters.perPage]);

  const rowVirtualizer = useVirtualizer({
    count: paginatedMonths.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 500, 
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  const { onSetMonths } = useWorkoutContext();
  const { isLoading, isError } = useQuery(
    'get-workouts',
    () => fetchWorkouts({ perPage: filters.perPage, page: 1 }),
    {
      onSuccess: (data) => {
        if (allMonths.length === 0) {
          const months = (data.months || [])
            .sort((a, b) => a.index - b.index)
            .map((month) => ({
              ...month,
              localId: month._id || uuid(),
              weeks: (month.weeks || []).map((week) => ({
                ...week,
                localId: week._id || uuid(),
                days: (week.days || []).map((day) => ({
                  ...day,
                  localId: day._id || uuid(),
                  warmups: (day.warmups || []).map((w) => ({
                    ...w,
                    localId: w._id || uuid(),
                  })),
                  exercises: (day.exercises || []).map((ex) => ({
                    ...ex,
                    localId: ex._id || uuid(),
                    extra: (ex.extra || []).map((e) => ({
                      ...e,
                      localId: e._id || uuid(),
                    })),
                  })),
                })),
              })),
            }));

          setAllMonths(months);
          onSetMonths(months);
        }
        setLoadingMonths(false);
      },
      onError: (err) => {
        console.error(err);
        setLoadingMonths(false);
      },
    }
  );
  const startIndex = (currentPage - 1) * filters.perPage;
  const monthsForPage = allMonths.slice(startIndex, startIndex + filters.perPage);

  const handleAddMonth = () => {
    const newMonth: Month = {
      title: '',
      description: '',
      vimeoId: '',
      thumbnail: null,
      startDate: null,
      endDate: null,
      weeks: [],
      localId: uuid()
    };

    setAllMonths((prev) => {
      const updated = [...prev, newMonth];
      onSetMonths(updated);
      const newMonthIndex = updated.length - 1;
      const newPage = Math.floor(newMonthIndex / filters.perPage) + 1;
      setCurrentPage(newPage);
      requestAnimationFrame(() => {
        rowVirtualizer.measure();
        scrollToMonth(newMonthIndex);

      });
      return updated;
    });

  };

  const scrollToMonth = useCallback((monthIndex: number) => {
    if (!parentRef.current) return;
    monthRefs.current.forEach((el) => {
      if (el) rowVirtualizer.measureElement(el);
    });
    requestAnimationFrame(() => {
      const monthEl = monthRefs.current[monthIndex];

      if (monthEl) {
        parentRef.current.scrollTo({
          top: monthEl.offsetTop,
          behavior: 'smooth',
        });
      } else {
        const item = rowVirtualizer.getVirtualItems().find(v => v.index === monthIndex);
        if (item) {
          parentRef.current.scrollTo({
            top: item.start,
            behavior: 'smooth',
          });
        } else {
          parentRef.current.scrollTo({
            top: monthIndex * 500,
            behavior: 'smooth',
          });
        }
      }
    });
  }, [rowVirtualizer]);

  const scrollToWeek = useCallback((monthIndex, weekIndex) => {
    const item = rowVirtualizer.getVirtualItems().find((v) => v.index === monthIndex);
    if (item && parentRef.current) {
      parentRef.current.scrollTo({ top: item.start, behavior: 'smooth' });
      requestAnimationFrame(() => {
        rowVirtualizer.measure();
        const weekElement = parentRef.current?.querySelector(`.month-${monthIndex} .week-${weekIndex}`);
        weekElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    } else if (parentRef.current) {
      parentRef.current.scrollTo({ top: monthIndex * 500, behavior: 'smooth' });
    }
  }, [rowVirtualizer]);
  const handleCollapseChange = () => {
    monthRefs.current.forEach((el) => {
      if (el) rowVirtualizer.measureElement(el);
    });
  };

  const scrollToDay = useCallback((monthIndex, weekIndex, dayIndex) => {
    const item = rowVirtualizer.getVirtualItems().find((v) => v.index === monthIndex);
    if (item && parentRef.current) {
      parentRef.current.scrollTo({ top: item.start, behavior: 'smooth' });
      requestAnimationFrame(() => {
        rowVirtualizer.measure();
        const dayElement = parentRef.current?.querySelector(`.month-${monthIndex} .week-${weekIndex} .day-${dayIndex}`);
        dayElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    } else if (parentRef.current) {
      parentRef.current.scrollTo({ top: monthIndex * 500, behavior: 'smooth' });
    }
  }, [rowVirtualizer]);
  if (loadingMonths || isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <p>Error loading workouts. Please try again later.</p>
      </div>
    );
  }
  return (
    <>
      <div className="flex justify-between sticky top-10">
        {allMonths.length < 1 ? (
          <Button variant="danger" onClick={handleAddMonth} startIcon={<PlusIcon className="h-4 w-4" />}>
            Add Month
          </Button>
        ) : (
          <span></span>
        )}
      </div>

      <div className="flex gap-4 h-[calc(100vh)]">

        <div className="w-1/4 max-h-full overflow-auto">
          {allMonths.length > 0 ? (
            <Navbar
              currentPage={currentPage}
              months={monthsForPage}
              perPage={filters.perPage}
              allMonths={allMonths}
              onCollapseChange={handleCollapseChange}
              setAllMonths={(months) => {
                setAllMonths(months);
                onSetMonths(months);
                const lastPage = Math.ceil(months.length / filters.perPage) || 1;
                if (currentPage > lastPage) setCurrentPage(lastPage);
              }}
              startIndex={startIndex}
              onScrollToMonth={scrollToMonth}
              onScrollToWeek={scrollToWeek}
              onScrollToDay={scrollToDay}
            />

          ) : null}
        </div>
        <div className="w-3/4 h-full overflow-auto">
          <div className="h-full w-full">
            <div
              ref={parentRef}
              className="h-full overflow-auto w-full"
            >
              <div
                style={{
                  height: rowVirtualizer.getTotalSize(),
                  position: 'relative',
                  width: '100%',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const month = paginatedMonths[virtualRow.index];
                  return (
                    <div
                      key={month.localId}
                      data-index={virtualRow.index}
                      ref={(el) => {
                        if (el) rowVirtualizer.measureElement(el);
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <MonthPlan
                        ref={(el) => monthRefs.current[virtualRow.index] = el}
                        monthIndex={virtualRow.index}
                        month={month}
                        scrollToMonth={scrollToMonth}
                        perPage={filters.perPage}
                        currentPage={currentPage}
                        startIndex={startIndex}
                        months={allMonths}
                        isCollapsed={!expandedMonths[month.localId]}
                        expandedWeeks={expandedWeeks}
                        setExpandedWeeks={setExpandedWeeks}
                        toggleCollapse={() =>
                          setExpandedMonths((prev) => ({
                            ...prev,
                            [month.localId]: !prev[month.localId],
                          }))
                        }

                        measure={rowVirtualizer.measure}
                        setCurrentPage={setCurrentPage}
                        addMonth={handleAddMonth}
                        updateMonths={(months) => {
                          setAllMonths(months);
                          onSetMonths(months);
                          const lastPage = Math.ceil(months.length / filters.perPage) || 1;
                          if (currentPage > lastPage) setCurrentPage(lastPage);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {allMonths.length > filters.perPage && (
            <div className="flex justify-center mt-6 px-4">
              <Pagination
                currentPage={currentPage}
                lastPage={Math.ceil(allMonths.length / filters.perPage)}
                maxLength={7}
                setCurrentPage={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};