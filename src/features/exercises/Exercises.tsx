import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { CreateExercise } from './components/CreateExercise';
import { ExercisesList } from './components/ExercisesList';
import { fetchCategoryTitles, fetchTagTitles, fetchEquipmentTitles, fetchExerciseTitles } from '../workouts/api';
import { fetchExercises } from './api'
import { useQuery } from 'react-query';
import { useUserStore } from '@/stores/user';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';

export const Exercises = () => {

  const { data: exerciseTitles } = useQuery('get-exercise-titles', () => fetchExerciseTitles({ filterString: '' }));

  const { data: equipmentTitles } = useQuery('get-equipment-titles', () => fetchEquipmentTitles({ filterString: '' }));

  const { data: categoryTitles, refetch: refetchCategoryTitles } = useQuery('get-category-titles', () => fetchCategoryTitles({ filterString: '' }));
  const { data: tagTitles, refetch: refetchTagTitles } = useQuery('get-tag-titles', () => fetchTagTitles({ filterString: '' }));
  const { data: exercises, isLoading } = useQuery(['get-exercises'], () => fetchExercises({}));
  const { setCurrentPage } = useUserStore();
  const data = exercises?.exercises||[]
  console.log(data)
  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: data ? data : [],
    translatableFields: ['title', 'description', 'thumbnail', 'videoThumbnail', 'vimeoId'],
  });
  console.log(availableLanguages,"availableLanguages,")
  useEffect(() => {
    setCurrentPage('equipments');
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
        <ExercisesList getValue={getValue} />
      </div>
    </ContentLayout>
  );
};
