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

export const WorkoutList = () => {
  const [allMonths, setAllMonths] = useState([]);
  const [loadingMonths, setLoadingMonths] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);

  const filters = useMemo(() => ({ perPage: 6, page: currentPage }), [currentPage]);
  const parentRef = useRef<HTMLDivElement>(null);
  const [expandedMonths, setExpandedMonths] = useState<{ [key: number]: boolean }>({});
  const paginatedMonths = useMemo(() => {
    const startIndex = (currentPage - 1) * filters.perPage;
    const endIndex = startIndex + filters.perPage;
    return allMonths.slice(startIndex, endIndex);
  }, [allMonths, currentPage, filters.perPage]);

  const rowVirtualizer = useVirtualizer({
    count: paginatedMonths.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 500,
  });

  const { onSetMonths } = useWorkoutContext();
  const { isLoading, isError  } = useQuery([
    'get-workouts',
    filters,
  ], () => fetchWorkouts(filters), {
    onSuccess: (data) => {
      const months = data.months?.sort((a, b) => a.index - b.index) || [];
      setAllMonths(months);
      onSetMonths(months);
      setLoadingMonths(false);
    },
    onError: (err) => {
      console.error('Error fetching workouts:', err);
      setLoadingMonths(false);
    },
  });

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

  const scrollToMonth = useCallback((monthIndex) => {
    requestAnimationFrame(() => {
      const item = rowVirtualizer.getVirtualItems().find((v) => v.index === monthIndex);
      if (item && parentRef.current) {
        parentRef.current.scrollTo({ top: item.start, behavior: 'smooth' });
      } else if (parentRef.current) {
        parentRef.current.scrollTo({ top: monthIndex * 500, behavior: 'smooth' });
      }
    });
  }, [rowVirtualizer]);

  const scrollToWeek = useCallback((monthIndex, weekIndex) => {
    const item = rowVirtualizer.getVirtualItems().find((v) => v.index === monthIndex);
    if (item && parentRef.current) {
      parentRef.current.scrollTo({ top: item.start, behavior: 'smooth' });
      requestAnimationFrame(() => {
        const weekElement = parentRef.current?.querySelector(`.month-${monthIndex} .week-${weekIndex}`);
        weekElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    } else if (parentRef.current) {
      parentRef.current.scrollTo({ top: monthIndex * 500, behavior: 'smooth' });
    }
  }, [rowVirtualizer]);

  const scrollToDay = useCallback((monthIndex, weekIndex, dayIndex) => {
    const item = rowVirtualizer.getVirtualItems().find((v) => v.index === monthIndex);
    if (item && parentRef.current) {
      parentRef.current.scrollTo({ top: item.start, behavior: 'smooth' });
      requestAnimationFrame(() => {
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

      <div className="flex">
        <div className="w-1/5 overflow-y-auto mt-[160px] mb-[110px] h-[calc(100vh-270px)] fixed top-0 z-10">
          {allMonths.length > 0 ? (
            <Navbar
              currentPage={currentPage}
              months={monthsForPage}
              perPage={filters.perPage}
              allMonths={allMonths}
              setAllMonths={(months) => {
                setAllMonths(months);
                onSetMonths(months);
              }}
              startIndex={startIndex}
              onScrollToMonth={scrollToMonth}
              onScrollToWeek={scrollToWeek}
              onScrollToDay={scrollToDay}
            />

          ) : null}
        </div>
        <div className="w-4/5 ml-[25%] mr-[3%]" >
          <div className="h-[500px] w-full">
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
                      key={month?._id || virtualRow.index}
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
                        monthIndex={virtualRow.index}
                        month={month}
                        scrollToMonth={scrollToMonth}

                        startIndex={startIndex}
                        months={allMonths}
                        isCollapsed={!expandedMonths[startIndex + virtualRow.index]}

                        toggleCollapse={() =>
                          setExpandedMonths((prev) => ({
                            ...prev,
                            [startIndex + virtualRow.index]: !prev[startIndex + virtualRow.index],
                          }))
                        }
                        measure={rowVirtualizer.measure}
                        setCurrentPage={setCurrentPage}
                        addMonth={handleAddMonth}
                        updateMonths={(months) => {
                          setAllMonths(months);
                          onSetMonths(months);
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