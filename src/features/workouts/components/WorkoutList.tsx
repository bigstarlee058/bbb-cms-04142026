import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
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
  const [scrollTarget, setScrollTarget] = useState<{ type: string; monthIndex: number; weekLocalId?: string; dayLocalId?: string; expandIfCollapsed?: boolean } | null>(null);
  const [monthCount, setMountCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1);

  const filters = useMemo(() => ({ perPage: 6, page: currentPage }), [currentPage]);
  const parentRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef<Record<string, HTMLDivElement | null>>({});
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
    estimateSize: () => 200,
    measureElement: (el) => el.getBoundingClientRect().height,
    overscan: 5,
  });
  useEffect(() => {
    const lastPage = Math.ceil(allMonths.length / filters.perPage) || 1;
    if (currentPage > lastPage) {
      setCurrentPage(lastPage);
    }
    requestAnimationFrame(() => {
      rowVirtualizer.measure();
    });
  }, [allMonths.length, filters.perPage, rowVirtualizer]);
  useEffect(() => {
  if (!scrollTarget) return;

  const targetIndexOnPage = scrollTarget.monthIndex % filters.perPage;
  const timer = setTimeout(() => {
    switch (scrollTarget.type) {
      case 'month':
        rowVirtualizer.scrollToIndex(targetIndexOnPage, { align: "auto" ,behavior:"smooth"});
        break;
        
      case 'week':
        if (scrollTarget.weekLocalId) {
          const month = allMonths[scrollTarget.monthIndex];
          if (!month) {
            console.warn("Month not found for scrollTarget:", scrollTarget.monthIndex);
            setScrollTarget(null);
            return;
          }

          const monthEl = monthRefs.current[month.localId];
          if (!monthEl) {
            console.warn("Month element not found in refs:", month.localId);
            setTimeout(() => {
              const retryEl = monthRefs.current[month.localId];
              if (retryEl) {
                scrollToWeekElement(month.localId, scrollTarget.weekLocalId!);
              }
            }, 200);
            setScrollTarget(null);
            return;
          }

          scrollToWeekElement(month.localId, scrollTarget.weekLocalId);
        }
        break;
        
      case 'day':
  if (scrollTarget.weekLocalId && scrollTarget.dayLocalId) {
    scrollToDay(
      scrollTarget.monthIndex,
      scrollTarget.weekLocalId,
      scrollTarget.dayLocalId,
      { expandIfCollapsed: scrollTarget.expandIfCollapsed !== false }
    );
  }
  break;
    }
    
    setScrollTarget(null);
  }, 200); 
  return () => clearTimeout(timer);
}, [scrollTarget, currentPage, allMonths]);

const scrollToWeekElement = (monthLocalId: string, weekLocalId: string) => {
  if (!parentRef.current) return;

  const monthEl = monthRefs.current[monthLocalId];
  if (!monthEl) {
    console.warn("Month element not found:", monthLocalId);
    return;
  }

  let weekEl = monthEl.querySelector(`.week-${weekLocalId}`) as HTMLElement;
  
  if (!weekEl) {

    let attempts = 0;
    const findWeekInterval = setInterval(() => {
      weekEl = monthEl.querySelector(`.week-${weekLocalId}`) as HTMLElement;
      attempts++;
      
      if (weekEl || attempts > 10) {
        clearInterval(findWeekInterval);
        
        if (weekEl && parentRef.current) {
          parentRef.current.scrollTo({
            top:
              weekEl.getBoundingClientRect().top -
              parentRef.current.getBoundingClientRect().top +
              parentRef.current.scrollTop,
            behavior: "smooth",
          });
        } else {
          console.warn("Week element not found after retries:", weekLocalId);
        }
      }
    }, 50);
    return;
  }

  parentRef.current.scrollTo({
    top:
      weekEl.getBoundingClientRect().top -
      parentRef.current.getBoundingClientRect().top +
      parentRef.current.scrollTop,
    behavior: "smooth",
  });
};
  const { onSetMonths } = useWorkoutContext();
  const { isLoading, isError } = useQuery(
    ['get-workouts'],
    () => fetchWorkouts({ page: 1, perPage: 1000 }),
    {
      onSuccess: (data) => {
        setMountCount(data?.count || 0);
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

        safeUpdateMonths(months);
        setLoadingMonths(false);
      },
      onError: (error) => {
        console.error(error);
        setLoadingMonths(false);
      },
    }
  );
  const startIndex = (currentPage - 1) * filters.perPage;
  const monthsForPage = allMonths.slice(startIndex, startIndex + filters.perPage);
  const safeUpdateMonths = (
  updatedMonths: Month[],
  options?: { syncPage?: boolean; skipMeasure?: boolean }
) => {
  const { syncPage = true, skipMeasure = false } = options || {};

  onSetMonths(updatedMonths);
  setAllMonths(updatedMonths);

  const lastPage = Math.max(1, Math.ceil(updatedMonths.length / filters.perPage));

  if (syncPage) {
    setCurrentPage(prevPage => {
      const newPage = Math.min(prevPage, lastPage);
      if (newPage !== prevPage) {
        requestAnimationFrame(() => {
          rowVirtualizer.scrollToIndex(0);
        });
      }
      return newPage;
    });
  }

  if (!skipMeasure) {
    requestAnimationFrame(() => {
      rowVirtualizer.measure();
    });
  }
};
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
      safeUpdateMonths(updated, { syncPage: false });
      const newMonthIndex = updated.length - 1;
      const newPage = Math.floor(newMonthIndex / filters.perPage) + 1;
      setCurrentPage(newPage);
      requestAnimationFrame(() => {
        Object.values(monthRefs.current).forEach((el) => {
          if (el) rowVirtualizer.measureElement(el);
        });
        scrollToMonth(newMonthIndex);

      });
      return updated;
    });

  };
  const scrollToMonth = useCallback((monthIndex: number) => {
    rowVirtualizer.scrollToIndex(monthIndex, { align: "auto",behavior:"smooth" });
  }, [rowVirtualizer]);
  const scrollToWeekSafe = useCallback(async (globalMonthIndex: number, weekLocalId: string) => {
  if (!parentRef.current) return;

  const month = allMonths[globalMonthIndex];
  if (!month) return;
  const currentPageStart = (currentPage - 1) * filters.perPage;
  const currentPageEnd = currentPageStart + filters.perPage;
  
  if (globalMonthIndex < currentPageStart || globalMonthIndex >= currentPageEnd) {
    const targetPage = Math.floor(globalMonthIndex / filters.perPage) + 1;
    setCurrentPage(targetPage);
    setExpandedMonths(prev => ({ ...prev, [month.localId]: true }));
    const weekKey = `${month.localId}-${weekLocalId}`;
    setExpandedWeeks(prev => ({ ...prev, [weekKey]: true }));
    
    setScrollTarget({ type: 'week', monthIndex: globalMonthIndex, weekLocalId });
    return;
  }

  let needsRemeasure = false;
  if (!expandedMonths[month.localId]) {
    setExpandedMonths(prev => ({ ...prev, [month.localId]: true }));
    needsRemeasure = true;
  }

  const weekKey = `${month.localId}-${weekLocalId}`;
  if (!expandedWeeks[weekKey]) {
    setExpandedWeeks(prev => ({ ...prev, [weekKey]: true }));
    needsRemeasure = true;
  }

  if (needsRemeasure) {
    await new Promise(res => setTimeout(res, 100));
    rowVirtualizer.measure();
    await new Promise(res => setTimeout(res, 100));
  }

  const monthEl = monthRefs.current[month.localId];
  if (!monthEl) {
    console.warn("Month element not found:", month.localId);
    return;
  }
  
  let weekEl = monthEl.querySelector(`.week-${weekLocalId}`) as HTMLElement;
  if (!weekEl) {
    await new Promise(res => setTimeout(res, 100));
    weekEl = monthEl.querySelector(`.week-${weekLocalId}`) as HTMLElement;
  }
  
  if (!weekEl) {
    console.warn("Week element not found:", weekLocalId);
    return;
  }

  parentRef.current.scrollTo({
    top:
      weekEl.getBoundingClientRect().top -
      parentRef.current.getBoundingClientRect().top +
      parentRef.current.scrollTop,
    behavior: "smooth",
  });
}, [allMonths, currentPage, filters.perPage, expandedMonths, expandedWeeks, rowVirtualizer]);
  const scrollToDay = async (
  globalMonthIndex: number,
  weekLocalId: string,
  dayLocalId: string,
  options?: { expandIfCollapsed?: boolean }
) => {
  if (!parentRef.current) return;

  const month = allMonths[globalMonthIndex];
  if (!month) return;
  const currentPageStart = (currentPage - 1) * filters.perPage;
  const currentPageEnd = currentPageStart + filters.perPage;

  if (globalMonthIndex < currentPageStart || globalMonthIndex >= currentPageEnd) {
    const targetPage = Math.floor(globalMonthIndex / filters.perPage) + 1;
    setCurrentPage(targetPage);
    setScrollTarget({ type: 'day', monthIndex: globalMonthIndex, weekLocalId, dayLocalId, expandIfCollapsed: options?.expandIfCollapsed ?? true });
    return;
  }

  let needsRemeasure = false;
  if (!expandedMonths[month.localId]) {
    setExpandedMonths(prev => ({ ...prev, [month.localId]: true }));
    needsRemeasure = true;
  }

  const weekKey = `${month.localId}-${weekLocalId}`;
  if (!expandedWeeks[weekKey]) {
    setExpandedWeeks(prev => ({ ...prev, [weekKey]: true }));
    needsRemeasure = true;
  }

  const dayKey = `${month.localId}-${weekLocalId}-${dayLocalId}`;
  const expandIfCollapsed = options?.expandIfCollapsed ?? true;
  if (expandIfCollapsed && !expandedDays[dayKey]) {
    setExpandedDays(prev => ({ ...prev, [dayKey]: true }));
    needsRemeasure = true;
  }

  if (needsRemeasure) {
    await new Promise(res => setTimeout(res, 80));
    rowVirtualizer.measure();
    await new Promise(res => setTimeout(res, 80));
  }

  const monthEl = monthRefs.current[month.localId];
  if (!monthEl) return;

  let dayEl: HTMLElement | null = null;
  for (let i = 0; i < 10; i++) {
    dayEl = monthEl.querySelector(`.day-${dayLocalId}`) as HTMLElement;
    if (dayEl) break;
    await new Promise(res => setTimeout(res, 100));
  }

  if (!dayEl) {
    console.warn("scrollToDay: day element not found after waiting.");
    return;
  }

  parentRef.current.scrollTo({
    top:
      dayEl.getBoundingClientRect().top -
      parentRef.current.getBoundingClientRect().top +
      parentRef.current.scrollTop,
    behavior: "smooth",
  });
};
  useEffect(() => {
  if (paginatedMonths.length === 0) return;
  requestAnimationFrame(() => {
    Object.values(monthRefs.current).forEach((el) => {
      if (el) rowVirtualizer.measureElement(el);
    });
  });
}, [paginatedMonths.length]);
  const handleDuplicateMonth = useCallback((realMonthIndex: number) => {
    const origin = allMonths[realMonthIndex];
    if (!origin) return;

    const newMonth = structuredClone(origin);
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
    setAllMonths((prev) => {
      const updated = [...prev];
      const newMonthIndex = realMonthIndex + 1;
      updated.splice(newMonthIndex, 0, newMonth);
      safeUpdateMonths(updated, { syncPage: false });
      const newPage = Math.floor(newMonthIndex / filters.perPage) + 1;
      setCurrentPage(newPage);
      requestAnimationFrame(() => {
        Object.values(monthRefs.current).forEach((el) => el && rowVirtualizer.measureElement(el));
        scrollToMonth(newMonthIndex);
      });

      return updated;
    });
  }, [allMonths, filters.perPage, safeUpdateMonths, rowVirtualizer, scrollToMonth]);
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
          <div className="w-1/4 h-[calc(100vh-270px)] overflow-auto">
            {allMonths.length > 0 && (
              <Navbar
                currentPage={currentPage}
                months={monthsForPage}
                perPage={filters.perPage}
                expandedWeeks={expandedWeeks}
                setExpandedWeeks={setExpandedWeeks}
                allMonths={allMonths}
                expandedMonths={expandedMonths}
                onCollapseChange={(monthLocalId, isCollapsed) => {
                  setExpandedMonths((prev) => ({
                    ...prev,
                    [monthLocalId]: !isCollapsed,
                  }));
                  requestAnimationFrame(() => rowVirtualizer.measure());
                }}
                setAllMonths={(months) => safeUpdateMonths(months)}
                startIndex={startIndex}
                onScrollToMonth={(globalMonthIndex) => {
                  const targetPage = Math.floor(globalMonthIndex / filters.perPage) + 1;
                  setCurrentPage(targetPage);
                  setScrollTarget({ type: 'month', monthIndex: globalMonthIndex });
                }}
                onScrollToWeek={(globalMonthIndex, weekIndex) => {
                  const targetPage = Math.floor(globalMonthIndex / filters.perPage) + 1;
                  const weekLocalId = allMonths[globalMonthIndex]?.weeks[weekIndex]?.localId;
                  if (!weekLocalId) return;

                  setCurrentPage(targetPage);
                  setScrollTarget({ type: 'week', monthIndex: globalMonthIndex, weekLocalId });
                }}
                onScrollToDay={(globalMonthIndex, weekIndex, dayIndex) => {
  const targetPage = Math.floor(globalMonthIndex / filters.perPage) + 1;
  const weekLocalId = allMonths[globalMonthIndex]?.weeks[weekIndex]?.localId;
  const dayLocalId = allMonths[globalMonthIndex]?.weeks[weekIndex]?.days[dayIndex]?.localId;
  if (!weekLocalId || !dayLocalId) return;

  setCurrentPage(targetPage);
  setScrollTarget({ type: 'day', monthIndex: globalMonthIndex, weekLocalId, dayLocalId, expandIfCollapsed: false });
}}
                expandedDays={expandedDays}
                setExpandedDays={setExpandedDays}
              />
            )}
          </div>

          <div className="w-3/4 h-full overflow-auto">
            <div className="h-full w-full">
              <div ref={parentRef} className="w-full">
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
                          monthRefs.current[month.localId] = el;
                        }} style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                          willChange: 'transform',
                        }}
                      >
                        <MonthPlan
                          ref={(el) => (monthRefs.current[month.localId] = el)}
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
                          measure={() => {
                            const el = monthRefs.current[month.localId];
                            if (el) rowVirtualizer.measureElement(el);
                          }}
                          setCurrentPage={setCurrentPage}
                          addMonth={handleAddMonth}
                          updateMonths={(months, options) => safeUpdateMonths(months, options)}
                          scrollToWeek={scrollToWeekSafe}
                          onScrollToDay={(monthIndex, weekIndex, dayLocalId) => {
                            const weekLocalId = allMonths?.[monthIndex]?.weeks?.[weekIndex]?.localId;
                            if (weekLocalId) scrollToDay(monthIndex, weekLocalId, dayLocalId);
                          }}
                          onDuplicateMonth={handleDuplicateMonth}

                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {monthCount >= filters.perPage && (
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