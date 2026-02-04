import { useEffect, useState } from 'react';
import { ContentLayout } from '@/components/Layout';
import { CreateExercise } from './components/CreateExercise';
import { ExercisesList } from './components/ExercisesList';
import { fetchCategoryTitles, fetchTagTitles, fetchEquipmentTitles, fetchExerciseTitles } from '../workouts/api';
import { fetchExercises } from './api'
import { useQuery } from 'react-query';
import { useUserStore } from '@/stores/user';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { useFilteringStore } from '@/stores/filter';
import { Filters } from '@/types';
export const Exercises = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1
  });

  const { setCurrentPage: setStorePage } = useUserStore();

  const { data: exerciseTitles } = useQuery('get-exercise-titles', () => fetchExerciseTitles({ filterString: '' }));
  const { data: equipmentTitles } = useQuery('get-equipment-titles', () => fetchEquipmentTitles({ filterString: '' }));
  const { data: categoryTitles, refetch: refetchCategoryTitles } = useQuery('get-category-titles', () => fetchCategoryTitles({ filterString: '' }));
  const { data: tagTitles, refetch: refetchTagTitles } = useQuery('get-tag-titles', () => fetchTagTitles({ filterString: '' }));

  const { data: exercises, isLoading } = useQuery(
    ['get-exercises', filters],
    () => fetchExercises(filters),
  );
  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: currentPage }));
  }, [currentPage]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: search, page: 1 }));
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, sortBy: sortBy?.value, page: 1 }));
    setCurrentPage(1);
  }, [sortBy?.value]);

  const data = exercises?.exercises || [];

  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: data,
    translatableFields: ['title', 'description', 'thumbnail', 'videoThumbnail', 'vimeoId'],
  });

  useEffect(() => {
    setStorePage('equipments');
  }, []);

  if (isLoading) {
    return (<>Getting the Available Exercises</>)
  }
  return (
    <ContentLayout title="">
      <div className="flex justify-between items-center">
        <h2>Exercises</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <CreateExercise
          exerciseTitles={exerciseTitles}
          equipmentTitles={equipmentTitles}
          categoryTitles={categoryTitles}
          tagTitles={tagTitles}
          onCategoryCreate={refetchCategoryTitles}
          onTagCreate={refetchTagTitles}
        />
      </div>
      <div className="mt-1">
        <ExercisesList
          getValue={getValue}
          exercises={exercises}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          exerciseTitles={exerciseTitles}
          equipmentTitles={equipmentTitles}
          categoryTitles={categoryTitles}
          tagTitles={tagTitles}
          refetchCategoryTitles={refetchCategoryTitles}
          refetchTagTitles={refetchTagTitles}
        />
      </div>
    </ContentLayout>
  );
};
