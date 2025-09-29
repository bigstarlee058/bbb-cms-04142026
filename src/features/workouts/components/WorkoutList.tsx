import { useState, useRef, useCallback, useMemo, useLayoutEffect } from 'react';
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
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>({});
  const paginatedMonths = useMemo(() => {
    const startIndex = (currentPage - 1) * filters.perPage;
    const endIndex = startIndex + filters.perPage;
    return allMonths.slice(startIndex, endIndex);
  }, [allMonths, currentPage, filters.perPage]);

  const rowVirtualizer = useVirtualizer({
    count: paginatedMonths.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 5,
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
        monthRefs.current.forEach((el) => {
          if (el) rowVirtualizer.measureElement(el);
        });
        scrollToMonth(newMonthIndex);

      });
      return updated;
    });

  };
  const scrollToMonth = useCallback((monthIndex: number) => {
    rowVirtualizer.scrollToIndex(monthIndex, { align: "start" });
  }, [rowVirtualizer]);
  const scrollToWeekSafe = async (monthIndex: number, weekLocalId: string) => {
    if (!parentRef.current) return;
    const month = allMonths[monthIndex];
    if (!expandedMonths[month.localId]) {
      setExpandedMonths(prev => ({ ...prev, [month.localId]: true }));
      await new Promise(requestAnimationFrame);
      monthRefs.current.forEach((el) => {
        if (el) rowVirtualizer.measureElement(el);
      });
    }

    await new Promise(requestAnimationFrame);

    const monthEl = monthRefs.current[monthIndex];
    if (!monthEl) return;

    const weekEl = monthEl.querySelector(`.week-${weekLocalId}`) as HTMLElement;
    if (!weekEl) return;

    parentRef.current.scrollTo({
      top: weekEl.getBoundingClientRect().top - parentRef.current.getBoundingClientRect().top + parentRef.current.scrollTop,
      behavior: "smooth",
    });
  };
  const scrollToDay = async (monthIndex: number, weekLocalId: string, dayLocalId: string) => {
    if (!parentRef.current) return;

    const month = allMonths[monthIndex];
    if (!expandedMonths[month.localId]) return;
    if (!expandedWeeks[weekLocalId]) return;

    await new Promise(requestAnimationFrame);

    const monthEl = monthRefs.current[monthIndex];
    if (!monthEl) return;

    const dayEl = monthEl.querySelector(`.day-${dayLocalId}`) as HTMLElement;
    if (!dayEl) return;

    parentRef.current.scrollTo({
      top:
        dayEl.getBoundingClientRect().top -
        parentRef.current.getBoundingClientRect().top +
        parentRef.current.scrollTop,
      behavior: "smooth",
    });
  };
  useLayoutEffect(() => {
    monthRefs.current.forEach((el) => {
      if (el) rowVirtualizer.measureElement(el);
    });
  }, [paginatedMonths, rowVirtualizer]);


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
          <Button
            variant="danger"
            onClick={handleAddMonth}
            startIcon={<PlusIcon className="h-4 w-4" />}
          >
            Add Month
          </Button>
        ) : (
          <span></span>
        )}
      </div>

      <div className="flex flex-col h-full">
        <div className="flex gap-4">
          <div className="w-1/4 h-[450px] overflow-auto">
            {allMonths.length > 0 && (
              <Navbar
                currentPage={currentPage}
                months={monthsForPage}
                perPage={filters.perPage}
                allMonths={allMonths}
                onCollapseChange={() => {
                  requestAnimationFrame(() => rowVirtualizer.measure());
                }}
                setAllMonths={(months) => {
                  setAllMonths(months);
                  onSetMonths(months);
                  const lastPage = Math.ceil(months.length / filters.perPage) || 1;
                  if (currentPage > lastPage) setCurrentPage(lastPage);
                }}
                startIndex={startIndex}
                onScrollToMonth={scrollToMonth}
                onScrollToWeek={(monthIndex, weekIndex) => {
                  const weekLocalId = allMonths[monthIndex]?.weeks[weekIndex]?.localId;
                  if (weekLocalId) scrollToWeekSafe(monthIndex, weekLocalId);
                }}
                onScrollToDay={(monthIndex, weekIndex, dayIndex) => {
                  const weekLocalId = allMonths[monthIndex]?.weeks[weekIndex]?.localId;
                  const dayLocalId = allMonths[monthIndex]?.weeks[weekIndex]?.days[dayIndex]?.localId;
                  if (weekLocalId && dayLocalId) scrollToDay(monthIndex, weekLocalId, dayLocalId);
                }}
              />
            )}
          </div>

          <div className="w-3/4 h-full overflow-auto">
            <div className="h-full w-full">
              <div ref={parentRef} className="h-[450px] overflow-auto w-full">
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
                          if (!el) return;
                          monthRefs.current[virtualRow.index] = el;
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
                          ref={(el) => (monthRefs.current[virtualRow.index] = el)}
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
                          expandedDays={expandedDays}
                          setExpandedDays={setExpandedDays}
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
          </div>
        </div>

        {allMonths.length > filters.perPage && (
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={currentPage}
              lastPage={Math.ceil(allMonths.length / filters.perPage)}
              maxLength={7}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>
    </>
  );

};