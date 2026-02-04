import { useState, useEffect } from 'react';
import { Filters } from '@/types';
import { Spinner } from '@/components/Elements';
import { useFilteringStore } from '@/stores/filter';
import { ContentLayout } from '@/components/Layout';
import { CreateTag } from './components/CreateTag';
import { TagsList } from './components/TagsList';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { fetchTags } from './api';
import { useQuery } from 'react-query';
export const Tags = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
  });

  const {
    data: tagData,
    isLoading,
  } = useQuery(
    ['get-tags', filters],
    () => fetchTags(filters),
    { keepPreviousData: true }
  );

  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: currentPage }));
  }, [currentPage]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: search, page: 1 }));
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, sortBy: sortBy?.value, page: 1 }));
    setCurrentPage(1);
  }, [sortBy?.value]);

  const { selectedLang, setSelectedLang, availableLanguages, hasTranslations, getValue } =
    useListTranslations({
      data: tagData?.tags || [],
      translatableFields: ['title'],
    });

  if (isLoading) {
    return (
      <ContentLayout title="">
        <div className="w-full h-48 flex justify-center items-center">
          <Spinner size="lg" />
        </div>
      </ContentLayout>
    );
  }

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
        <h2>Tags</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <CreateTag />
      </div>
      <div className="mt-2">
        <TagsList
          getValue={getValue}
          tagData={tagData}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </ContentLayout>
  );
};