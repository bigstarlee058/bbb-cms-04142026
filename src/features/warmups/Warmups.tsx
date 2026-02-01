import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { WarmupList } from './components/WarmupList';
import { CreateWarmUp } from './components/CreateWarmup';
import { fetchWarmups } from './api';
import { useQuery } from 'react-query';
import { fetchEquipmentTitles } from '../workouts/api';
import { useUserStore } from '@/stores/user';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';

export const Warmups = () => {
  const { setCurrentPage } = useUserStore();
  const { data: titles } = useQuery('get-equipment-titles', () =>
    fetchEquipmentTitles({ filterString: '' })
  );
  const {
    data: warmupData,
    isLoading,
  } = useQuery(['get-warmups', {}], () => fetchWarmups({}));

  useEffect(() => {
    setCurrentPage("warmups");
  }, []);
  const data = warmupData?.warmups || [];
  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: data ? data : [],
    translatableFields: ['title', 'description','vimeoId'],
  });
   if (isLoading) {
    return (<>Getting the Available Warmups</>)
  }
  return (
     <ContentLayout title="">
      <div className="flex justify-between items-center">
        <h2>Warmups</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <CreateWarmUp titles={titles} />
      </div>
      <div className="mt-1">
        <WarmupList getValue={getValue} />
      </div>
    </ContentLayout>
  );
};
