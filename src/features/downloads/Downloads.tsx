import { useEffect, useState } from 'react';
import { ContentLayout } from '@/components/Layout';
import { DownloadsList } from './components/DownloadsList';
import { CreateDownload } from './components/CreateDownload';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { Spinner } from '@/components/Elements';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { useFilteringStore } from '@/stores/filter';
import { fetchDownloads } from './api';
import { Filters } from '@/types';

export const Downloads = () => {
  const { setCurrentPage: setCurrentUserPage } = useUserStore();
  const { search, sortBy } = useFilteringStore();

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const [filters, setFilters] = useState<Filters>({
    perPage,
    page: currentPage,
  });

  const { data: downloadData, isLoading } = useQuery(
    ['get-downloads', filters],
    () => fetchDownloads(filters),
    {
      keepPreviousData: true,
    }
  );

  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: downloadData?.downloads,
    translatableFields: ['title', 'description', 'pdf'],
  });

  useEffect(() => {
    setCurrentUserPage('downloads');
  }, []);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: currentPage }));
  }, [currentPage]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, sortBy: sortBy?.value, page: 1 }));
    setCurrentPage(1);
  }, [sortBy]);

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
        <h2>Downloads</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <CreateDownload />
      </div>
      <div className="mt-4 max-w-8xl">
        <DownloadsList
          getValue={getValue}
          downloadData={downloadData}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          perPage={perPage}
        />
      </div>
    </ContentLayout>
  );
};