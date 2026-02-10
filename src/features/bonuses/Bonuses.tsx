import { useEffect, useState } from 'react';
import { ContentLayout } from '@/components/Layout';
import { CreateBonus } from './components/CreateBonus';
import { BonusesList } from './components/BonusesList';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { Spinner } from '@/components/Elements';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { useFilteringStore } from '@/stores/filter';
import { fetchBonuses } from './api';
import { Filters } from '@/types';

export const Bonuses = () => {
  const { setCurrentPage: setCurrentUserPage } = useUserStore();
  const { search, sortBy } = useFilteringStore();
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [filters, setFilters] = useState<Filters>({
    perPage,
    page: currentPage,
  });

  const { data: bonusData, isLoading } = useQuery(
    ['get-bonuses', filters],
    () => fetchBonuses(filters),
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
    data: bonusData?.bonuses,
    translatableFields: ['title', 'description'],
  });

  useEffect(() => {
    setCurrentUserPage("bonuses");
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
        <h2>Bonuses</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <CreateBonus />
      </div>
      <div className="mt-4 max-w-8xl">
        <BonusesList
          getValue={getValue}
          bonusData={bonusData}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          perPage={perPage}
        />
      </div>
    </ContentLayout>
  );
};
