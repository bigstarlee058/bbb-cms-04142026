import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { SectionsList } from './components/SectionsList';
import { CreateSection } from './components/CreateSection';
import { EditMainInfo } from './components/EditMainInfo';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { useNotificationStore } from '@/stores/notifications';
import { fetchPhasesMainInfo, fetchSections } from './api';
import { ErrorMessage } from '@/types';
import { Spinner } from '@/components/Elements';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';

export const Sections = () => {
  const { addNotification } = useNotificationStore();
  const { setCurrentPage } = useUserStore();

  const { data: sectionData, isLoading: sectionsLoading } = useQuery(
    ['get-sections'],
    () => fetchSections({ perPage: 1000, page: 1 })
  );

  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: sectionData?.phases,
    translatableFields: ["title", "description"],
  });

  const { data, isLoading: mainInfoLoading, error } = useQuery('get-phasesmaininfo', fetchPhasesMainInfo, {
    onError: (err: ErrorMessage) => {
      addNotification({
        type: 'success',
        title: err.message
      });
    }
  });

  useEffect(() => {
    setCurrentPage("phases");
  }, []);

  if (sectionsLoading || mainInfoLoading || !data) {    
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return (
    <ContentLayout title="">
      <div className="grid grid-cols-3 gap-4 items-center">
        <h2>Phases</h2>
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
          <EditMainInfo maininfoData={data}/>
          <div className='w-3'/>
          <CreateSection/>
        </div>
      </div>
      <div className="mt-2">
        <SectionsList 
          getValue={getValue}
          sectionData={sectionData}
        />
      </div>
    </ContentLayout>
  );
};