import { ContentLayout } from '@/components/Layout';
import { CreateAchievementsGroup } from './components/CreateAchievementsGroup';
import { AchievementsGroupList } from './components/AchievementsGroupList';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { fetchAchievementsIndividualTitles } from '../workouts/api';
import { useEffect } from 'react';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { Spinner } from '@/components/Elements';
import { fetchAchievements } from './api';
export const AchievementsGroup = () => {
  const { setCurrentPage } = useUserStore();
  const { data: titles } = useQuery('get-collection-titles', () =>
    fetchAchievementsIndividualTitles({ filterString: '' })
  );
  const { data: achievementsData, isLoading } = useQuery(['get-achievementsgroups'], () =>
    fetchAchievements({ perPage: 10, page: 1 })
  );

  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: achievementsData?.achievementsGroups,
    translatableFields: ["title", "description"],
  });
  useEffect(() => {
    setCurrentPage("achievements-group");
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
    <div className="flex justify-between items-center">
      <h2>Achievements Group</h2>
      <div>
        {hasTranslations && (
          <LanguageSwitcher
            availableLanguages={availableLanguages}
            selectedLang={selectedLang}
            onLanguageChange={setSelectedLang}
          />
        )}
      </div>
      <CreateAchievementsGroup titles={titles} />
    </div>
    <div className="mt-4">
      <AchievementsGroupList
        getValue={getValue}
        achievementsData={achievementsData}
        titles={titles}
      />
    </div>
  </ContentLayout>
);
};
