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
import { useLockStore } from '@/stores/lock';

export const WorkoutList = () => {
  const { isReadOnly } = useLockStore();
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

    const timer = requestAnimationFrame(() => {
      switch (scrollTarget.type) {
        case 'month': {
          const targetIndexOnPage = scrollTarget.monthIndex % filters.perPage;
          rowVirtualizer.scrollToIndex(targetIndexOnPage, { align: "start", behavior: "smooth" });
          break;
        }
        case 'week': {
          if (scrollTarget.weekLocalId) {
            scrollToWeekSafe(scrollTarget.monthIndex, scrollTarget.weekLocalId);
          }
          break;
        }
        case 'day': {
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
      }
      setScrollTarget(null);
    });

    return () => cancelAnimationFrame(timer);
  }, [scrollTarget]);

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
            localId:  uuid(),
            weeks: (month.weeks || []).map((week) => ({
              ...week,
              localId: uuid(),
              days: (week.days || []).map((day) => ({
                ...day,
                localId:  uuid(),
                warmups: (day.warmups || []).map((w) => ({
                  ...w,
                  localId:  uuid(),
                })),
                exercises: (day.exercises || []).map((ex) => ({
                  ...ex,
                  localId:  uuid(),
                  extra: (ex.extra || []).map((e) => ({
                    ...e,
                    localId:  uuid(),
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
      titleTranslations:{},
      description: '',
      vimeoId: '',
      vimeoIdTranslations:{},
      thumbnail: null,
      thumbnailTranslations:{},
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
    rowVirtualizer.scrollToIndex(monthIndex, { align: "start", behavior: "smooth" });
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
      setScrollTarget({ type: 'week', monthIndex: globalMonthIndex, weekLocalId });
      return;
    }

    let needsRemeasure = false;
    const weekKey = `${month.localId}-${weekLocalId}`;

    setExpandedMonths(prev => {
      if (!prev[month.localId]) {
        needsRemeasure = true;
        return { ...prev, [month.localId]: true };
      }
      return prev;
    });
    setExpandedWeeks(prev => {
      if (!prev[weekKey]) {
        needsRemeasure = true;
        return { ...prev, [weekKey]: true };
      }
      return prev;
    });

    if (needsRemeasure) {
      await new Promise(res => requestAnimationFrame(res));
      rowVirtualizer.measure();
      await new Promise(res => requestAnimationFrame(res));
    }

    const monthEl = monthRefs.current[month.localId];
    if (!monthEl) return;

    const weekEl = monthEl.querySelector(`.week-${weekLocalId}`) as HTMLElement;
    if (!weekEl) return;

    parentRef.current.scrollTo({
      top: weekEl.offsetTop - 20,
      behavior: "smooth",
    });
  }, [allMonths, currentPage, filters.perPage, rowVirtualizer]);
  const scrollToDay = useCallback(async (
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

    const expandIfCollapsed = options?.expandIfCollapsed ?? true;
    let needsRemeasure = false;
    const weekKey = `${month.localId}-${weekLocalId}`;
    const dayKey = `${month.localId}-${weekLocalId}-${dayLocalId}`;

    setExpandedMonths(prev => {
      if (!prev[month.localId]) {
        needsRemeasure = true;
        return { ...prev, [month.localId]: true };
      }
      return prev;
    });

    setExpandedWeeks(prev => {
      if (!prev[weekKey]) {
        needsRemeasure = true;
        return { ...prev, [weekKey]: true };
      }
      return prev;
    });

    if (expandIfCollapsed) {
      setExpandedDays(prev => {
        if (!prev[dayKey]) {
          needsRemeasure = true;
          return { ...prev, [dayKey]: true };
        }
        return prev;
      });
    }

    if (needsRemeasure) {
      await new Promise(res => requestAnimationFrame(res));
      rowVirtualizer.measure();
      await new Promise(res => requestAnimationFrame(res));
    }

    const monthEl = monthRefs.current[month.localId];
    if (!monthEl) return;

    const dayEl = monthEl.querySelector(`.day-${dayLocalId}`) as HTMLElement;
    if (!dayEl) return;

    parentRef.current.scrollTo({
      top: dayEl.offsetTop - 20,
      behavior: "smooth",
    });

  }, [allMonths, currentPage, filters.perPage, rowVirtualizer]);
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
    delete newMonth.createdAt;
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
      
      const lastMonth = prev[prev.length - 1];
      newMonth.index = lastMonth?.index !== undefined 
        ? lastMonth.index + 1 
        : prev.length + 1;
      const updated = [...prev, newMonth];
      const newMonthIndex = updated.length - 1;
      
      safeUpdateMonths(updated, { syncPage: false });
      
      const newPage = Math.floor(newMonthIndex / filters.perPage) + 1;
      setCurrentPage(newPage);
      setScrollTarget({ type: 'month', monthIndex: newMonthIndex });
      
      requestAnimationFrame(() => {
        Object.values(monthRefs.current).forEach((el) => {
          if (el) rowVirtualizer.measureElement(el);
        });
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
            disabled={isReadOnly}
            startIcon={<PlusIcon className="h-4 w-4" />}
          >
            Add Month
          </Button>
        ) : (
          <span></span>
        )}
      </div>

      <div className="flex flex-col h-full" >
        <div className="flex gap-4" >
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

          <div className="w-3/4 h-full " >
            <div className="h-full w-full">
              <div className="w-full" ref={parentRef}>
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
                          onScrollToDay={(monthIndex, weekIndex, dayLocalId, options) => {
                            const weekLocalId = allMonths?.[monthIndex]?.weeks?.[weekIndex]?.localId;
                            if (weekLocalId) scrollToDay(monthIndex, weekLocalId, dayLocalId, options);
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