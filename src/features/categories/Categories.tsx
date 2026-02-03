import { ContentLayout } from '@/components/Layout';
import { CreateCategory } from './components/CreateCategory';
import { CategoriesList } from './components/CategoriesList';
import { useQuery } from 'react-query';
import { fetchCategories } from './api';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { useEffect, useState } from 'react';
import { useFilteringStore } from '@/stores/filter';
import { Filters } from '@/types';
export const Categories = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
  });

  const {
    data,
    isLoading,
  } = useQuery(
    ['get-categories', filters],
    () => fetchCategories(filters),
    {
      keepPreviousData: true,
    }
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

  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: data?.categories ? data?.categories : [],
    translatableFields: ['title'],
  });
  if (isLoading) {
    return (<>Getting the Available Categories</>)
  }
  return (
    <ContentLayout title="">
      <div className="flex justify-between items-center">
        <h2>Categories</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <CreateCategory />
      </div>
            <div className="mt-2">
        <CategoriesList
          getValue={getValue}
          categoryData={data}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </ContentLayout>
  );
};