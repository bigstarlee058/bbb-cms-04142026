import { ContentLayout } from '@/components/Layout';
import { CreateAchievementsIndividual } from './components/CreateAchievementsIndividual';
import { AchievementsIndividualList } from './components/AchievementsIndividualList';
import { fetchAchievementsTargetTitles, fetchTagTitles } from '../workouts/api';
import { fetchAchievements } from './api';
import { useQuery } from 'react-query';
import { useUserStore } from '@/stores/user';
import { useEffect } from 'react';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { Spinner } from '@/components/Elements';

export const AchievementsIndividual = () => {
  const { setCurrentPage } = useUserStore();
  const { data: othertitles } = useQuery('get-other-titles', () =>
    fetchAchievementsTargetTitles({ filterString: '' })
  );

  const { data: tagtitles } = useQuery('get-tags-titles', () =>
    fetchTagTitles({ filterString: '' })
  );
  const { data: achievementsData, isLoading } = useQuery(
    ['get-achievements'],
    () => fetchAchievements({ perPage: 1000, page: 1 }) // Fetch large amount or all
  );

  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: achievementsData?.achievementsIndividuals,
    translatableFields: ["title", "description"],
  });

  useEffect(() => {
    setCurrentPage("achievements-individual");
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <ContentLayout title="">
      <div className="grid grid-cols-3 gap-4 items-center">
        <h2>Achievements Individual</h2>
        <div className="flex justify-center">
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <div className="flex justify-end">
          <CreateAchievementsIndividual tagtitles={tagtitles} othertitles={othertitles} />
        </div>
      </div>
      <div className="mt-2">
        <AchievementsIndividualList
          getValue={getValue}
          achievementsData={achievementsData}
          tagtitles={tagtitles}
          othertitles={othertitles}
        />
      </div>
    </ContentLayout>
  );
};