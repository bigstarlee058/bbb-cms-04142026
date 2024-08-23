import { useState, useRef, useEffect } from 'react';
import { Button, Spinner } from '@/components/Elements';
import { PlusIcon, SaveIcon } from '@heroicons/react/outline';
import { Navbar } from './Navbar';
import { MonthPlan } from './MonthPlan';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchWorkouts, updateWorkouts } from '@/features/workouts/api';
import { useFilteringStore } from '@/stores/filter';
import Pagination from '@/components/Elements/Pagination';

export const WorkoutList = () => {
  const [months, setMonths] = useState([]);
  const [allMonths, setAllMonths] = useState([]);
  const [loadingMonths, setLoadingMonths] = useState(true); // New state for loading months
  const workoutListRef = useRef(null);
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState({
    perPage: 5,
    page: 1,
  });

  // Fetch workouts data from the server
  const { data: workouts, isLoading, isError } = useQuery(
    ['get-workouts', filters],
    () => fetchWorkouts(filters),
    {
      onSuccess: (data) => {
        const months = data.months.sort((a, b) => a.index - b.index);
        setAllMonths(months);
        setLoadingMonths(false); // Data fetched, no longer loading
      },
      onError: (err) => {
        console.error('Error fetching workouts:', err);
        setLoadingMonths(false); // Ensure loading state is set to false even on error
      },
    }
  );

  useEffect(() => {
    if (allMonths.length) {
      const startIndex = (currentPage - 1) * filters.perPage;
      const paginatedMonths = allMonths.slice(startIndex, Math.min(startIndex + filters.perPage, allMonths.length));
      setMonths(paginatedMonths);
      const totalPages = Math.ceil((allMonths.length || 0) / (filters.perPage || 10));
      if (currentPage === totalPages + 1 && totalPages !== 0 && paginatedMonths.length === 0) {
        setCurrentPage(prev => prev - 1);
      }
    }
  }, [currentPage, allMonths]);

  // Mutation for updating workouts
  const updateWorkoutsMutation = useMutation(updateWorkouts, {
    onSuccess: () => {
      queryClient.invalidateQueries('get-workouts');
      alert('Workouts saved successfully!');
    },
    onError: (err) => {
      console.error('Error updating workouts:', err);
      alert('Failed to save workouts. Please try again.');
    },
  });

  // Handle adding a new month
  const handleAddMonth = () => {
    const newMonth = {
      _id: '',
      index: allMonths.length + 1,
      title: '',
      description: '',
      vimeoId: '',
      thumbnail: null,
      weeks: [],
    };
    setAllMonths((prev) => [...prev, newMonth]);
  };

  const handleSaveWorkouts = () => {
    if (window.confirm('Are you sure you want to save the workouts?')) {
      updateWorkoutsMutation.mutate(allMonths);
    }
  };

  const scrollToMonth = (monthIndex) => {
    if (workoutListRef.current) {
      const monthElement = workoutListRef.current.querySelector(`.month-${monthIndex}`);
      monthElement?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToWeek = (monthIndex, weekIndex) => {
    if (workoutListRef.current) {
      const weekElement = workoutListRef.current.querySelector(
        `.month-${monthIndex} .week-${weekIndex}`
      );
      weekElement?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToDay = (monthIndex, weekIndex, dayIndex) => {
    if (workoutListRef.current) {
      const dayElement = workoutListRef.current.querySelector(
        `.month-${monthIndex} .week-${weekIndex} .day-${dayIndex}`
      );
      dayElement?.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
      <div className="flex justify-between">
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
        <Button
          variant="danger"
          onClick={handleSaveWorkouts}
          startIcon={<SaveIcon className="h-4 w-4" />}
          isLoading={updateWorkoutsMutation.isLoading}
          disabled={updateWorkoutsMutation.isLoading}
        >
          Save
        </Button>
      </div>
      <div className="flex">
        <div className="w-1/5 overflow-y-auto mt-[160px] mb-[110px] h-[calc(100vh-270px)] fixed top-0 z-10">
          {allMonths.length > 0 ? (          
            <Navbar
            currentPage={currentPage}
            months={months}
            setMonths={setAllMonths}
            onScrollToMonth={scrollToMonth}
            onScrollToWeek={scrollToWeek}
            onScrollToDay={scrollToDay}
            />
          ): null}
        </div>
        <div className="w-4/5 ml-[25%] mr-[3%]" ref={workoutListRef}>
          {months.map((month, monthIndex) => (
            <MonthPlan
              key={month._id || monthIndex}
              monthIndex={monthIndex}
              month={month}
              addMonth={handleAddMonth}
              currentPage={currentPage}
              months={allMonths}
              updateMonths={setAllMonths}
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
