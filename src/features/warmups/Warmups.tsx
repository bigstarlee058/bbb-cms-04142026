import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { WarmupList } from './components/WarmupList';
import { CreateWarmUp } from './components/CreateWarmup';
import { useState } from 'react';
import { Filters } from '@/types';
import { useFilteringStore } from '@/stores/filter';
import { fetchWarmups } from './api';
import { useQuery } from 'react-query';
import { fetchEquipmentTitles } from '../workouts/api';
import { useUserStore } from '@/stores/user';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { Spinner } from '@/components/Elements';
export const Warmups = () => {
  const { setCurrentPage: setStorePage } = useUserStore();
  const [currentPage, setCurrentPage] = useState(1);
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
  });

  const { data: titles } = useQuery('get-equipment-titles', () =>
    fetchEquipmentTitles({ filterString: '' })
  );

  const { data: warmupData, isLoading } = useQuery(
    ['get-warmups', filters],
    () => fetchWarmups(filters),
    { keepPreviousData: true }
  );

  useEffect(() => {
    setStorePage("warmups");
  }, []);

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

  const data = warmupData?.warmups || [];

  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: data,
    translatableFields: ['title', 'description', 'vimeoId'],
  });

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
        <WarmupList
          getValue={getValue}
          warmupData={warmupData}
          titles={titles}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </ContentLayout>
  );
};