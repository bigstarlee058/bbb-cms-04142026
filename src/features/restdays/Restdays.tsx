import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { RestdayList } from './components/RestdayList';
import { CreateRestday } from './components/CreateRestday';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { fetchEquipmentTitles } from '../workouts/api';
import { fetchRestdays } from './api';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { Spinner } from '@/components/Elements';

export const Restdays = () => {
  const { setCurrentPage } = useUserStore();
  const { data: titles } = useQuery('get-equipment-titles', () =>
    fetchEquipmentTitles({ filterString: '' })
  );
  
  const { data: restdayData, isLoading } = useQuery(['get-restdays'], () => 
    fetchRestdays({ perPage: 10, page: 1 })
  );

  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: restdayData?.restdays,
    translatableFields: ["title", "description"],
  });

  useEffect(() => {
    setCurrentPage("restdays");
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
        <h2>Restdays</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <CreateRestday titles={titles}/>
      </div>
      <div className="mt-2">
        <RestdayList 
          getValue={getValue} 
          restdayData={restdayData}
          titles={titles}
        />
      </div>
    </ContentLayout>
  );
};