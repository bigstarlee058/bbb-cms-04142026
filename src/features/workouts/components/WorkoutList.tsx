import { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Spinner } from '@/components/Elements';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, SaveIcon } from '@heroicons/react/outline';
import { Navbar } from './Navbar';
import { MonthPlan } from './MonthPlan';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchWorkouts } from '@/features/workouts/api';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';
import { Month } from '@/types';
import { SaveConfirmation } from './custom/SaveConfirmation';
import { useWorkoutContext } from '../WorkoutContext';

export const WorkoutList = () => {
  const [months, setMonths] = useState([]);
  const [allMonths, setAllMonths] = useState([]);
  const [loadingMonths, setLoadingMonths] = useState(true); // New state for loading months
  const workoutListRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState({
    perPage: 13,
    page: 1
  });

  const { onSetMonths } = useWorkoutContext();

  // Fetch workouts data from the server
  const {
    data: workouts,
    isLoading,
    isError
  } = useQuery(['get-workouts', filters], () => fetchWorkouts(filters), {
    onSuccess: (data) => {
      const months = data.months?.sort((a, b) => a.index - b.index);
      setAllMonths(months);
      onSetMonths(months);
      setLoadingMonths(false); // Data fetched, no longer loading
    },
    onError: (err) => {
      console.error('Error fetching workouts:', err);
      setLoadingMonths(false); // Ensure loading state is set to false even on error
    }
  });

  useEffect(() => {
    if (allMonths.length) {
      const startIndex = (currentPage - 1) * filters.perPage;
      const paginatedMonths = allMonths.slice(startIndex, Math.min(startIndex + filters.perPage, allMonths.length));
      setMonths(paginatedMonths);
      const totalPages = Math.ceil((allMonths.length || 0) / (filters.perPage || 10));
      if (currentPage === totalPages + 1 && totalPages !== 0 && paginatedMonths.length === 0) {
        setCurrentPage((prev) => prev - 1);
      }
    }
  }, [currentPage, allMonths]);

  // Handle adding a new month
  const handleAddMonth = () => {
    const newMonth: Month = {
      title: '',
      description: '',
      vimeoId: '',
      thumbnail: null,
      startDate: null,
      endDate: null,

      weeks: []
    };
    setAllMonths((prev) => {
      onSetMonths([...prev, newMonth]);
      return [...prev, newMonth];
    });
  };

  const scrollToMonth = useCallback((monthIndex) => {
    if (workoutListRef.current) {
      const monthElement = workoutListRef.current.querySelector(`.month-${monthIndex}`);
      monthElement?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const scrollToWeek = useCallback((monthIndex, weekIndex) => {
    if (workoutListRef.current) {
      const weekElement = workoutListRef.current.querySelector(`.month-${monthIndex} .week-${weekIndex}`);
      weekElement?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const scrollToDay = useCallback((monthIndex, weekIndex, dayIndex) => {
    if (workoutListRef.current) {
      const dayElement = workoutListRef.current.querySelector(
        `.month-${monthIndex} .week-${weekIndex} .day-${dayIndex}`
      );
      dayElement?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // const scrollToTop = () => {
  //   if (workoutListRef.current) {
  //     const monthElement = workoutListRef.current.querySelector(`.month-0`);
  //     monthElement?.scrollIntoView({ behavior: 'smooth' });
  //   }
  // };

  // const scrollToBottom = () => {
  //   if (workoutListRef.current) {
  //     workoutListRef.current.scrollTop = workoutListRef.current.scrollHeight;
  //   }
  // };

  // Handle display state based on loading and error
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
        {/* <SaveConfirmation allMonths={allMonths}/> */}
      </div>
      {/* <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        <Button
          variant="danger"
          onClick={scrollToTop}
          startIcon={<ChevronUpIcon className="h-6 w-4" />}
        />
        <Button
          variant="danger"
          onClick={scrollToBottom}
          startIcon={<ChevronDownIcon className="h-6 w-4" />}
        />
      </div> */}
      <div className="flex">
        <div className="w-1/5 overflow-y-auto mt-[160px] mb-[110px] h-[calc(100vh-270px)] fixed top-0 z-10">
          {allMonths.length > 0 ? (
            <Navbar
              currentPage={currentPage}
              months={months}
              allMonths={allMonths}
              setAllMonths={(months) => {
                setAllMonths(months);
                onSetMonths(months);
              }}
              onScrollToMonth={scrollToMonth}
              onScrollToWeek={scrollToWeek}
              onScrollToDay={scrollToDay}
            />
          ) : null}
        </div>
        <div className="w-4/5 ml-[25%] mr-[3%]" ref={workoutListRef}>
          {months.map((month, monthIndex) => (
            <MonthPlan
              key={month?._id || monthIndex}
              monthIndex={monthIndex}
              month={month}
              months={allMonths}
              currentPage={currentPage}
              addMonth={handleAddMonth}
              updateMonths={(months) => {
                setAllMonths(months);
                onSetMonths(months);
              }}
            />
          ))}
        </div>
      </div>
      {allMonths.length > 0 ? (
        <div className="flex justify-center mt-6 px-4">
          <Pagination
            currentPage={currentPage}
            lastPage={Math.ceil((allMonths?.length || 0) / (filters?.perPage || 10))}
            maxLength={7}
            setCurrentPage={setCurrentPage}
          />
        </div>
      ) : null}
    </>
  );
};
