import { useEffect, useState } from 'react';
import { ContentLayout } from '@/components/Layout';
import { SectionsList } from './components/SectionsList';
import { CreateSection } from './components/CreateSection';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { Spinner } from '@/components/Elements';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { fetchSections } from './api';
export const Sections = () => {
  const { setCurrentPage: setCurrentUserPage } = useUserStore();
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const { data: sectionData, isLoading } = useQuery(
    ['get-sections', currentPage, perPage],
    () => fetchSections({ page: currentPage, perPage })
  );

  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: sectionData?.sections,
    translatableFields: ['title', 'description', 'vimeoId'],
  });
  const handlePageChange = (page: number) => {
  console.log('Page changed to:', page);
  setCurrentPage(page);
};

  useEffect(() => {
    setCurrentUserPage("sections");
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
        <h2>Sections</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <CreateSection />
      </div>
      <div className="mt-4">
        <SectionsList
          getValue={getValue}
          sectionData={sectionData}
          currentPage={currentPage}
          setCurrentPage={handlePageChange}
          perPage={perPage}
        />
      </div>
    </ContentLayout>
  );
};
