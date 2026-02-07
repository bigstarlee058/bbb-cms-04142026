import { ContentLayout } from '@/components/Layout';
import { CreateAchievementsTarget } from './componets/CreateAchievementsTarget';
import { AchievementsTargetsList } from './componets/AchievementsTargetsList';
import { useQuery } from 'react-query';
import { fetchTargets } from './api';
import { useEffect } from 'react';
import { useUserStore } from '@/stores/user';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { Spinner } from '@/components/Elements';

export const AchievementsTarget = () => {
  const { setCurrentPage } = useUserStore();

  const { data: targetData, isLoading } = useQuery(
    ['get-targets'],
    () => fetchTargets({ perPage: 1000, page: 1 })
  );

  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: targetData?.achievementsTargets,
    translatableFields: ["title"],
  });

  useEffect(() => {
    setCurrentPage("achievements-target");
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
        <h2>Achievements Target</h2>
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
          <CreateAchievementsTarget />
        </div>
      </div>
      <div className="mt-4">
        <AchievementsTargetsList 
          getValue={getValue}
          targetData={targetData}
        />
      </div>
    </ContentLayout>
  );
};