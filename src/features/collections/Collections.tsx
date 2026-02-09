import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';

import { CreateCollection } from './components/CreateCollection';
import { CollectionsList } from './components/CollectionsList';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { Spinner } from '@/components/Elements';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { fetchCollections } from './api';

export const Collections = () => {
  const { setCurrentPage } = useUserStore();
  const { data: collectionData, isLoading } = useQuery(['get-collections'], () => fetchCollections({}));

  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: collectionData?.collections,
    translatableFields: ['title', 'description', 'thumbnail'],
  });

  useEffect(() => {
    setCurrentPage("collections");
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
        <h2>Collections</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <CreateCollection />
      </div>
      <div className="mt-4 max-w-8xl">
        <CollectionsList getValue={getValue} collectionData={collectionData} />
      </div>
    </ContentLayout>
  );
};
